import cv2
import numpy as np
import json
import mediapipe as mp

# --- Configuración de MediaPipe Tasks ---
BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
FaceLandmarksConnections = mp.tasks.vision.FaceLandmarksConnections

TESSELATION_CONNECTIONS = FaceLandmarksConnections.FACE_LANDMARKS_TESSELATION
CONTOUR_CONNECTIONS = FaceLandmarksConnections.FACE_LANDMARKS_CONTOURS

def draw_face_mesh(image, face_landmarks):
    h, w, _ = image.shape
    points = [(int(lm.x * w), int(lm.y * h)) for lm in face_landmarks]

    for conn in TESSELATION_CONNECTIONS:
        cv2.line(image, points[conn.start], points[conn.end], (200, 200, 200), 1, cv2.LINE_AA)

    for conn in CONTOUR_CONNECTIONS:
        cv2.line(image, points[conn.start], points[conn.end], (0, 255, 0), 2, cv2.LINE_AA)

def main():
    # Lista a grabar: "idle" más todo el abecedario
    items_to_record = ["idle"] + [chr(i) for i in range(ord('A'), ord('Z')+1)]
    current_idx = 0
    saved_landmarks = {}

    print("=" * 50)
    print("  GRABADOR AVANZADO DE FONEMAS")
    print("=" * 50)
    print("Presiona ENTER para grabar el fonema actual y avanzar.")
    print("Presiona Q para salir temprano y guardar.")
    print("=" * 50)

    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='face_landmarker.task'),
        running_mode=mp.tasks.vision.RunningMode.VIDEO,
        num_faces=1,
    )

    landmarker = FaceLandmarker.create_from_options(options)
    cap = cv2.VideoCapture(0)
    frame_ts = 0

    while cap.isOpened() and current_idx < len(items_to_record):
        success, frame = cap.read()
        if not success: continue

        frame_ts += 33
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = landmarker.detect_for_video(mp_image, frame_ts)

        display = frame.copy()
        current_landmarks = None

        if result.face_landmarks:
            face_lms = result.face_landmarks[0]
            current_landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in face_lms]
            draw_face_mesh(display, face_lms)

        display = cv2.flip(display, 1)

        current_item = items_to_record[current_idx]
        
        # UI en pantalla
        cv2.putText(display, f"Grabando: {current_item}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)
        cv2.putText(display, "Haz el gesto y presiona ENTER", (10, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(display, f"Progreso: {current_idx+1}/{len(items_to_record)}", (10, 120),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

        if not current_landmarks:
            cv2.putText(display, "NO SE DETECTA CARA", (10, 160),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        cv2.imshow('Grabador', display)

        key = cv2.waitKey(5) & 0xFF
        
        # ENTER es 13 en ASCII
        if key == 13 or key == ord('\r'):
            if current_landmarks:
                saved_landmarks[current_item] = current_landmarks
                print(f"✓ Guardado '{current_item}'")
                current_idx += 1
            else:
                print(f"✗ No se detectó cara para '{current_item}', intenta de nuevo.")
        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    landmarker.close()

    if saved_landmarks:
        with open('landmarks.json', 'w') as f:
            json.dump(saved_landmarks, f)
        print(f"\n✓ Datos guardados en 'landmarks.json' ({len(saved_landmarks)} fonemas)")
    else:
        print("\n✗ No se guardó nada.")

if __name__ == '__main__':
    main()
