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

def text_to_viseme_sequence(text):
    sequence = []
    for i, char in enumerate(text):
        viseme = get_phoneme(char)
        char_lower = char.lower()
        if char_lower in 'aeiouáéíóú':
            duration = 4
        elif char_lower == ' ':
            duration = 3
        elif char_lower in '.,!?¿¡':
            duration = 10
        else:
            duration = 2
            
        sequence.append({
            'viseme': viseme,
            'duration': duration,
            'char_index': i
        })
    sequence.append({'viseme': 'idle', 'duration': 15, 'char_index': len(text)})
    return sequence

def get_rotation_matrix(rx, ry, rz):
    Rx = np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
    Ry = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]])
    Rz = np.array([[math.cos(rz), -math.sin(rz), 0], [math.sin(rz), math.cos(rz), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx

def draw_face_3d(image, landmarks, connections_data, width, height, time_t, is_speaking):
    float_y = math.sin(time_t * 2.0) * 15.0
    
    if is_speaking:
        rot_x = math.sin(time_t * 4.0) * 0.05 - 0.1
        rot_y = math.sin(time_t * 3.0) * 0.15
        rot_z = math.sin(time_t * 2.5) * 0.05
    else:
        rot_x = math.sin(time_t * 1.5) * 0.05
        rot_y = math.sin(time_t * 1.0) * 0.1
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


# ─── Hilos de Entrada y TTS ───────────────────────────────────────────────
input_queue = queue.Queue()
tts_queue = queue.Queue()

def input_thread_func():
    while True:
        try:
            text = input("")
            if text.strip():
                input_queue.put(text.strip())
        except EOFError:
            break

def tts_thread_func(text):
    # Generar el audio y guardarlo
    tts = gTTS(text, lang='es', tld='com.mx') # tld='com.mx' para acento latino
    filename = f"temp_{int(time.time())}.mp3"
    tts.save(filename)
    # Avisar al hilo principal que el audio está listo
    tts_queue.put((text, filename))

def main():
    WIDTH, HEIGHT = 800, 600
    FPS = 30
    frame_delay = 1.0 / FPS

    print("=" * 50)
    print("  ANIMADOR 3D FLUIDO + VOZ EN TIEMPO REAL")
    print("=" * 50)
    print("La ventana gráfica ya está abierta.")
    print("Escribe aquí tu texto y presiona ENTER.")
    print("Generando voz (tarda ~1 segundo)...")
    print("=" * 50)

    threading.Thread(target=input_thread_func, daemon=True).start()

    current_text = ""
    timeline = []
    anim_index = 0
    frame_in_anim = 0
    
    current_shape = phoneme_shapes['idle'].copy()
    target_shape = phoneme_shapes['idle'].copy()
    current_char_index = 0
    
    SMOOTHING = 0.35 
    start_time = time.time()
    
    is_generating_audio = False

    while True:
        loop_start = time.time()
        time_t = loop_start - start_time

        # 1. Leer entrada del usuario y arrancar generación de audio
        if not input_queue.empty():
            msg = input_queue.get()
            if msg.lower() == 'salir':
                break
            is_generating_audio = True
            threading.Thread(target=tts_thread_func, args=(msg,), daemon=True).start()

        # 2. Revisar si el audio ya se generó
        if not tts_queue.empty():
            msg, audio_file = tts_queue.get()
            is_generating_audio = False
            
            # Cargar y reproducir audio
            pygame.mixer.music.load(audio_file)
            pygame.mixer.music.play()
            
            # Preparar la animación
            current_text = msg
            sequence = text_to_viseme_sequence(msg)
            
            # Pequeño ajuste: calcular duración total del audio vs duración de animación
            # Para un hackathon, simplemente arrancamos a la vez.
            timeline = sequence
            anim_index = 0
            frame_in_anim = 0
            current_char_index = 0
            if len(timeline) > 0:
                target_shape = phoneme_shapes[timeline[0]['viseme']].copy()

        # Verifica si seguimos reproduciendo audio (para mantener la cara activa si hay desfase)
        is_playing = pygame.mixer.music.get_busy()
        is_speaking = (anim_index < len(timeline)) or is_playing

        if anim_index < len(timeline):
            current_step = timeline[anim_index]
            target_shape = phoneme_shapes[current_step['viseme']]
            current_char_index = current_step['char_index']
            
            frame_in_anim += 1
            if frame_in_anim >= current_step['duration']:
                anim_index += 1
                frame_in_anim = 0
                if anim_index < len(timeline):
                    target_shape = phoneme_shapes[timeline[anim_index]['viseme']]
        else:
            # Si se acabó el texto pero el audio sigue, intenta mantener la boca un poco abierta/moviéndose
            if is_playing:
                target_shape = phoneme_shapes.get('A', phoneme_shapes['idle'])
            else:
                target_shape = phoneme_shapes['idle']

        # Interpolación fluida
        current_shape = current_shape + (target_shape - current_shape) * SMOOTHING

        # Renderizado
        image = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        cv2.circle(image, (WIDTH//2, HEIGHT//2), 300, (20, 10, 10), -1)

        draw_face_3d(image, current_shape, connections, WIDTH, HEIGHT, time_t, is_speaking)

        if current_text:
            display_text = current_text[:current_char_index+1]
            if not is_speaking and not is_playing:
                display_text = current_text
                
            font = cv2.FONT_HERSHEY_DUPLEX
            text_size = cv2.getTextSize(display_text, font, 1.0, 2)[0]
            text_x = (WIDTH - text_size[0]) // 2
            text_y = HEIGHT - 50
            
            cv2.putText(image, display_text, (text_x+2, text_y+2), font, 1.0, (0, 0, 0), 4)
            if is_generating_audio:
                cv2.putText(image, display_text, (text_x, text_y), font, 1.0, (100, 100, 100), 2)
                cv2.putText(image, "Pensando...", (10, 30), font, 0.7, (0, 255, 255), 1)
            else:
                cv2.putText(image, display_text, (text_x, text_y), font, 1.0, (255, 255, 255), 2)

        cv2.imshow('Animador Facial 3D', image)

        # Control FPS
        elapsed = time.time() - loop_start
        wait_time = max(1, int(frame_delay * 1000 - elapsed * 1000))
        key = cv2.waitKey(wait_time) & 0xFF
        if key == ord('q') or key == 27:
            break

    cv2.destroyAllWindows()
    
    # Limpiar archivos de audio temporales
    for file in os.listdir():
        if file.startswith("temp_") and file.endswith(".mp3"):
            try: os.remove(file)
            except: pass

if __name__ == '__main__':
    main()
