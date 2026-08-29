import cv2
import numpy as np
import json
import time
import threading
import queue
import math
import os
os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
import pygame
from gtts import gTTS
from mutagen.mp3 import MP3

# Inicializar motor de audio
pygame.mixer.init()

# ─── Cargar datos ───────────────────────────────────────────────────────────
with open('landmarks.json', 'r') as f:
    raw_landmarks = json.load(f)

with open('connections.json', 'r') as f:
    connections = json.load(f)

phoneme_shapes = {}
for phoneme, lms in raw_landmarks.items():
    phoneme_shapes[phoneme] = np.array([[p['x'], p['y'], p['z']] for p in lms], dtype=np.float64)

if 'idle' not in phoneme_shapes:
    phoneme_shapes['idle'] = np.mean(list(phoneme_shapes.values()), axis=0)

NORMALIZACION = {'á': 'A', 'é': 'E', 'í': 'I', 'ó': 'O', 'ú': 'U', 'ñ': 'N'}

def get_phoneme(char):
    char = char.lower()
    char = NORMALIZACION.get(char, char)
    char = char.upper()
    if char in phoneme_shapes:
        return char
    return 'idle'

def build_viseme_track(text, audio_duration):
    weights = []
    for char in text:
        c = char.lower()
        if c in 'aeiouáéíóú': weights.append(3.0)
        elif c == ' ': weights.append(1.5)
        elif c in '.,!?¿¡': weights.append(4.0)
        else: weights.append(1.0)

    total_weight = sum(weights)
    if total_weight == 0: return []

    usable_duration = audio_duration * 0.92
    track = []
    current_time = 0.0
    for i, (char, weight) in enumerate(zip(text, weights)):
        char_duration = (weight / total_weight) * usable_duration
        viseme = get_phoneme(char)
        track.append({
            'start': current_time,
            'end': current_time + char_duration,
            'viseme': viseme,
            'char_index': i,
        })
        current_time += char_duration
    return track

def get_rotation_matrix(rx, ry, rz):
    Rx = np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
    Ry = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]])
    Rz = np.array([[math.cos(rz), -math.sin(rz), 0], [math.sin(rz), math.cos(rz), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx

def draw_face_3d(image, landmarks, connections_data, width, height, time_t, is_speaking, head_rot_x, head_rot_y):
    float_y = math.sin(time_t * 2.0) * 10.0
    
    # Combinamos la rotación de tracking con la animación idle natural
    if is_speaking:
        rot_x = head_rot_x + (math.sin(time_t * 4.0) * 0.03 - 0.05)
        rot_y = head_rot_y + (math.sin(time_t * 3.0) * 0.05)
        rot_z = math.sin(time_t * 2.5) * 0.03
    else:
        rot_x = head_rot_x + (math.sin(time_t * 1.5) * 0.03)
        rot_y = head_rot_y + (math.sin(time_t * 1.0) * 0.05)
        rot_z = math.sin(time_t * 0.5) * 0.02

    R = get_rotation_matrix(rot_x, rot_y, rot_z)
    cam_w, cam_h = 640, 480
    xs = (landmarks[:, 0] - 0.5) * cam_w
    ys = (landmarks[:, 1] - 0.5) * cam_h
    zs = landmarks[:, 2] * cam_w

    points_3d = np.column_stack((xs, ys, zs))
    rotated_points = points_3d @ R.T

    focal_length = 500.0
    scale = 1.5

    points_2d = []
    for p in rotated_points:
        x, y, z = p
        z_cam = z + 600.0
        f = focal_length / z_cam
        px = int(x * f * scale + width / 2)
        py = int(y * f * scale + height / 2 + float_y)
        points_2d.append((px, py))

    for s, e in connections_data['tesselation']:
        cv2.line(image, points_2d[s], points_2d[e], (255, 255, 255), 1, cv2.LINE_AA)

    eyebrows_set = set(tuple(sorted(c)) for c in connections_data.get('eyebrows', []))
    for s, e in connections_data['contours']:
        pair = tuple(sorted((s, e)))
        if pair in eyebrows_set:
            cv2.line(image, points_2d[s], points_2d[e], (150, 150, 150), 2, cv2.LINE_AA)
        else:
            cv2.line(image, points_2d[s], points_2d[e], (255, 255, 255), 1, cv2.LINE_AA)

    for s, e in connections_data.get('eyebrows', []):
        cv2.line(image, points_2d[s], points_2d[e], (150, 150, 150), 2, cv2.LINE_AA)

    for s, e in connections_data['lips']:
        cv2.line(image, points_2d[s], points_2d[e], (150, 150, 150), 2, cv2.LINE_AA)


# ─── Hilos ──────────────────────────────────────────────────────────────────
input_queue = queue.Queue()
audio_ready_queue = queue.Queue()

# Variables globales para el tracking de mirada
tracking_nx = 0.0
tracking_ny = 0.0

def input_thread_func():
    while True:
        try:
            text = input("")
            if text.strip():
                input_queue.put(text.strip())
        except EOFError:
            break

def tts_thread_func(text):
    filename = f"temp_{int(time.time() * 1000)}.mp3"
    tts = gTTS(text, lang='es', tld='com.mx')
    tts.save(filename)
    audio_info = MP3(filename)
    duration = audio_info.info.length
    audio_ready_queue.put((text, filename, duration))

def webcam_tracking_thread():
    global tracking_nx, tracking_ny
    cap = cv2.VideoCapture(0)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            time.sleep(0.1)
            continue
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Reducir resolución para más FPS en la detección
        small_gray = cv2.resize(gray, (320, 240))
        faces = face_cascade.detectMultiScale(small_gray, scaleFactor=1.2, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) > 0:
            # Tomar la cara más grande
            faces = sorted(faces, key=lambda x: x[2]*x[3], reverse=True)
            x, y, w, h = faces[0]
            
            # Centro de la cara
            cx = x + w/2
            cy = y + h/2
            
            # Normalizar entre -1 y 1
            nx = (cx / 320.0) * 2.0 - 1.0
            ny = (cy / 240.0) * 2.0 - 1.0
            
            tracking_nx = nx
            tracking_ny = ny
        else:
            # Si no ve a nadie, vuelve a mirar al centro suavemente
            tracking_nx *= 0.9
            tracking_ny *= 0.9

        time.sleep(0.05) # ~20 FPS tracking
        
    cap.release()

def main():
    WIDTH, HEIGHT = 800, 600
    FPS = 30
    frame_delay = 1.0 / FPS

    print("=" * 50)
    print("  ANIMADOR 3D + VOZ + SEGUIMIENTO FACIAL")
    print("=" * 50)
    print("La cámara se encenderá en breve. ¡Mueve tu cabeza!")
    print("Escribe tu texto y presiona ENTER.")
    print("Escribe 'salir' para cerrar.")
    print("=" * 50)

    threading.Thread(target=input_thread_func, daemon=True).start()
    threading.Thread(target=webcam_tracking_thread, daemon=True).start()

    current_text = ""
    viseme_track = []
    audio_start_time = None
    audio_duration = 0.0
    is_generating = False

    current_shape = phoneme_shapes['idle'].copy()
    target_shape = phoneme_shapes['idle'].copy()
    current_char_index = 0

    SMOOTHING = 0.35
    start_time = time.time()
    
    # Variables de suavizado de cámara
    current_rot_x = 0.0
    current_rot_y = 0.0

    while True:
        loop_start = time.time()
        time_t = loop_start - start_time

        if not input_queue.empty():
            msg = input_queue.get()
            if msg.lower() == 'salir':
                break
            is_generating = True
            current_text = msg
            threading.Thread(target=tts_thread_func, args=(msg,), daemon=True).start()

        if not audio_ready_queue.empty():
            text, audio_file, duration = audio_ready_queue.get()
            is_generating = False
            audio_duration = duration
            viseme_track = build_viseme_track(text, audio_duration)
            pygame.mixer.music.load(audio_file)
            pygame.mixer.music.play()
            audio_start_time = time.time()

        is_speaking = False
        if audio_start_time is not None:
            elapsed = time.time() - audio_start_time
            if elapsed < audio_duration:
                is_speaking = True
                found = False
                for item in viseme_track:
                    if item['start'] <= elapsed < item['end']:
                        target_shape = phoneme_shapes[item['viseme']]
                        current_char_index = item['char_index']
                        found = True
                        break
                if not found:
                    target_shape = phoneme_shapes['idle']
                    current_char_index = len(current_text)
            else:
                target_shape = phoneme_shapes['idle']
                current_char_index = len(current_text)
                if not pygame.mixer.music.get_busy():
                    audio_start_time = None
        else:
            target_shape = phoneme_shapes['idle']

        current_shape = current_shape + (target_shape - current_shape) * SMOOTHING

        # ─── Tracking de Mirada ─────────────────────────────────────────
        # Mapeamos la posición -1 a 1 de la cámara a ángulos de rotación de cabeza
        # Recordar que la cámara hace efecto espejo, ajustamos el signo:
        target_rot_x = tracking_ny * 0.4  # arriba/abajo
        target_rot_y = -tracking_nx * 0.5 # izquierda/derecha
        
        # Suavizar el movimiento de la cabeza
        current_rot_x += (target_rot_x - current_rot_x) * 0.1
        current_rot_y += (target_rot_y - current_rot_y) * 0.1

        # ─── Renderizado ────────────────────────────────────────────────
        image = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        cv2.circle(image, (WIDTH // 2, HEIGHT // 2), 300, (20, 10, 10), -1)

        draw_face_3d(image, current_shape, connections, WIDTH, HEIGHT, time_t, is_speaking, current_rot_x, current_rot_y)

        if current_text:
            if is_speaking: display_text = current_text[:current_char_index + 1]
            else: display_text = current_text

            font = cv2.FONT_HERSHEY_DUPLEX
            text_size = cv2.getTextSize(display_text, font, 1.0, 2)[0]
            text_x = (WIDTH - text_size[0]) // 2
            text_y = HEIGHT - 50

            cv2.putText(image, display_text, (text_x + 2, text_y + 2), font, 1.0, (0, 0, 0), 4)
            if is_generating:
                cv2.putText(image, "Generando voz...", (10, 30), font, 0.7, (0, 255, 255), 1)
                cv2.putText(image, display_text, (text_x, text_y), font, 1.0, (100, 100, 100), 2)
            else:
                cv2.putText(image, display_text, (text_x, text_y), font, 1.0, (255, 255, 255), 2)

        cv2.imshow('Animador Facial 3D', image)

        elapsed_frame = time.time() - loop_start
        wait_time = max(1, int(frame_delay * 1000 - elapsed_frame * 1000))
        key = cv2.waitKey(wait_time) & 0xFF
        if key == ord('q') or key == 27:
            break

    cv2.destroyAllWindows()
    for file in os.listdir():
        if file.startswith("temp_") and file.endswith(".mp3"):
            try: os.remove(file)
            except: pass

if __name__ == '__main__':
    main()
