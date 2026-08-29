import cv2
import numpy as np
import json
import time
import threading
import queue
import math

# ─── Cargar datos ───────────────────────────────────────────────────────────
with open('landmarks.json', 'r') as f:
    raw_landmarks = json.load(f)

with open('connections.json', 'r') as f:
    connections = json.load(f)

# Convertir landmarks a arrays numpy (478 puntos x 3 coordenadas)
vowel_shapes = {}
for vowel, lms in raw_landmarks.items():
    vowel_shapes[vowel] = np.array([[p['x'], p['y'], p['z']] for p in lms], dtype=np.float64)

# Crear forma "neutra"
neutral = np.mean(list(vowel_shapes.values()), axis=0)
vowel_shapes['_'] = neutral

# ─── Mapeo de letras a vocales ──────────────────────────────────────────────
LETTER_TO_VISEME = {
    'a': 'A', 'á': 'A', 'e': 'E', 'é': 'E', 'i': 'I', 'í': 'I',
    'o': 'O', 'ó': 'O', 'u': 'U', 'ú': 'U',
    'b': 'U', 'p': 'U', 'm': 'U', 'f': 'U', 'v': 'U',
    'd': 'I', 't': 'I', 'n': 'I', 'l': 'I', 's': 'I',
    'z': 'I', 'c': 'I', 'r': 'E',
    'g': 'O', 'k': 'O', 'j': 'A', 'q': 'O', 'x': 'A',
    'h': '_', 'w': 'U', 'y': 'I', 'ñ': 'I',
    ' ': '_', ',': '_', '.': '_', '!': '_', '?': '_',
    '¿': '_', '¡': '_', '\n': '_'
}

def text_to_viseme_sequence(text):
    sequence = []
    text_lower = text.lower()
    for i, char in enumerate(text_lower):
        viseme = LETTER_TO_VISEME.get(char, '_')
        if char in 'aeiouáéíóú': duration = 6
        elif char == ' ': duration = 4
        elif char in '.,!?¿¡': duration = 8
        else: duration = 3
        sequence.append({
            'viseme': viseme,
            'duration': duration,
            'char_index': i
        })
    sequence.append({'viseme': '_', 'duration': 15, 'char_index': len(text)})
    return sequence

def interpolate_shapes(shape_a, shape_b, t):
    return shape_a * (1.0 - t) + shape_b * t

def get_rotation_matrix(rx, ry, rz):
    # Matrices de rotación
    Rx = np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
    Ry = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]])
    Rz = np.array([[math.cos(rz), -math.sin(rz), 0], [math.sin(rz), math.cos(rz), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx

def draw_face_3d(image, landmarks, connections_data, width, height, time_t, is_speaking):
    # Efecto de levitación y respiración
    float_y = math.sin(time_t * 2.0) * 15.0
    
    # Inclinación cuando habla o está quieto
    if is_speaking:
        rot_x = math.sin(time_t * 4.0) * 0.05 - 0.1 # Ligeramente inclinado hacia adelante/atrás
        rot_y = math.sin(time_t * 3.0) * 0.15      # Mueve la cabeza a los lados
        rot_z = math.sin(time_t * 2.5) * 0.05
    else:
        rot_x = math.sin(time_t * 1.5) * 0.05
        rot_y = math.sin(time_t * 1.0) * 0.1
        rot_z = math.sin(time_t * 0.5) * 0.02
        
    R = get_rotation_matrix(rot_x, rot_y, rot_z)

    # Convertir a coordenadas reales aproximadas para corregir proporción
    # MediaPipe asume que X e Y están normalizados (0 a 1) sobre el ancho y alto original
    # Asumimos que la cámara era 640x480
    cam_w, cam_h = 640, 480
    
    xs = (landmarks[:, 0] - 0.5) * cam_w
    ys = (landmarks[:, 1] - 0.5) * cam_h
    zs = landmarks[:, 2] * cam_w
    
    points_3d = np.column_stack((xs, ys, zs))
    
    # Aplicar rotación
    rotated_points = points_3d @ R.T
    
    # Proyección perspectiva
    focal_length = 500.0
    scale = 1.5 # Escala general
    
    points_2d = []
    for p in rotated_points:
        x, y, z = p
        # Distancia de la cámara
        z_cam = z + 600.0
        
        # Proyección
        f = focal_length / z_cam
        px = int(x * f * scale + width / 2)
        py = int(y * f * scale + height / 2 + float_y)
        points_2d.append((px, py))
        
    # Dibujar Tesselation (Blanco)
    for s, e in connections_data['tesselation']:
        cv2.line(image, points_2d[s], points_2d[e], (255, 255, 255), 1, cv2.LINE_AA)

    # Identificar qué conexiones son de cejas y cuáles no
    eyebrows_set = set(tuple(sorted(c)) for c in connections_data.get('eyebrows', []))
    lips_set = set(tuple(sorted(c)) for c in connections_data['lips'])

    # Dibujar Contornos (Blanco, pero si son cejas, Plomo)
    for s, e in connections_data['contours']:
        pair = tuple(sorted((s, e)))
        if pair in eyebrows_set:
            cv2.line(image, points_2d[s], points_2d[e], (150, 150, 150), 2, cv2.LINE_AA)
        else:
            cv2.line(image, points_2d[s], points_2d[e], (255, 255, 255), 1, cv2.LINE_AA)
            
    # Asegurar que las cejas se dibujen (por si no están en contours)
    for s, e in connections_data.get('eyebrows', []):
        cv2.line(image, points_2d[s], points_2d[e], (150, 150, 150), 2, cv2.LINE_AA)

    # Dibujar Labios (Plomo)
    for s, e in connections_data['lips']:
        cv2.line(image, points_2d[s], points_2d[e], (150, 150, 150), 2, cv2.LINE_AA)

# ─── Hilo de Entrada (Terminal) ─────────────────────────────────────────────
input_queue = queue.Queue()

def input_thread_func():
    while True:
        try:
            text = input("")
            if text.strip():
                input_queue.put(text.strip())
        except EOFError:
            break

# ─── Bucle Principal (OpenCV) ───────────────────────────────────────────────
def main():
    WIDTH, HEIGHT = 800, 600
    FPS = 30
    frame_delay = 1.0 / FPS

    print("=" * 50)
    print("  ANIMADOR 3D FLOTANTE")
    print("=" * 50)
    print("La ventana gráfica ya está abierta.")
    print("Escribe aquí tu texto y presiona ENTER para animar.")
    print("No se bloqueará la pantalla. (Escribe 'salir' para cerrar)")
    print("=" * 50)

    # Iniciar hilo de lectura de terminal
    threading.Thread(target=input_thread_func, daemon=True).start()

    current_text = ""
    timeline = []
    anim_index = 0
    frame_in_anim = 0
    current_shape = vowel_shapes['_'].copy()
    start_shape = vowel_shapes['_'].copy()
    target_shape = vowel_shapes['_'].copy()
    current_char_index = 0
    
    start_time = time.time()

    while True:
        loop_start = time.time()
        time_t = loop_start - start_time

        # Revisar si hay nuevo texto
        if not input_queue.empty():
            msg = input_queue.get()
            if msg.lower() == 'salir':
                break
            current_text = msg
            sequence = text_to_viseme_sequence(msg)
            
            # Construir timeline
            timeline = []
            for item in sequence:
                timeline.append({
                    'target': vowel_shapes[item['viseme']],
                    'duration': item['duration'],
                    'char_index': item['char_index']
                })
                
            anim_index = 0
            frame_in_anim = 0
            current_char_index = 0
            start_shape = current_shape.copy()
            if len(timeline) > 0:
                target_shape = timeline[0]['target']

        is_speaking = (anim_index < len(timeline))

        # Lógica de Animación
        if is_speaking:
            current_step = timeline[anim_index]
            duration = current_step['duration']
            transition_frames = max(1, duration // 2)
            
            if frame_in_anim < transition_frames:
                # Transición (ease in-out)
                t = (frame_in_anim + 1) / transition_frames
                t = t * t * (3.0 - 2.0 * t)
                current_shape = interpolate_shapes(start_shape, target_shape, t)
            else:
                # Mantener
                current_shape = target_shape.copy()

            current_char_index = current_step['char_index']
            
            frame_in_anim += 1
            if frame_in_anim >= duration:
                # Avanzar al siguiente visema
                anim_index += 1
                frame_in_anim = 0
                start_shape = current_shape.copy()
                if anim_index < len(timeline):
                    target_shape = timeline[anim_index]['target']
        else:
            # Volver a neutral si terminó de hablar
            current_shape = interpolate_shapes(current_shape, vowel_shapes['_'], 0.1)

        # Renderizado
        image = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        
        # Fondo (opcional, un degradado muy suave)
        cv2.circle(image, (WIDTH//2, HEIGHT//2), 300, (20, 10, 10), -1)

        # Dibujar cara 3D
        draw_face_3d(image, current_shape, connections, WIDTH, HEIGHT, time_t, is_speaking)

        # Dibujar Subtítulos (texto progresivo)
        if current_text:
            display_text = current_text[:current_char_index+1]
            if not is_speaking:
                display_text = current_text # Mostrar completo al terminar
                
            # Sombra del texto
            font = cv2.FONT_HERSHEY_DUPLEX
            text_size = cv2.getTextSize(display_text, font, 1.0, 2)[0]
            text_x = (WIDTH - text_size[0]) // 2
            text_y = HEIGHT - 50
            
            cv2.putText(image, display_text, (text_x+2, text_y+2), font, 1.0, (0, 0, 0), 4)
            cv2.putText(image, display_text, (text_x, text_y), font, 1.0, (255, 255, 255), 2)

        cv2.imshow('Animador Facial 3D', image)

        # Manejar FPS y teclas de OpenCV
        key = cv2.waitKey(max(1, int(frame_delay * 1000 - (time.time() - loop_start) * 1000))) & 0xFF
        if key == ord('q') or key == 27: # Q o ESC
            break

    cv2.destroyAllWindows()
    print("\nCerrando el animador.")

if __name__ == '__main__':
    main()
