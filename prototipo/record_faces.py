import cv2
import numpy as np
import json
import mediapipe as mp

# --- Configuración de MediaPipe Tasks ---
BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
FaceLandmarksConnections = mp.tasks.vision.FaceLandmarksConnections
DrawingUtils = mp.tasks.vision.drawing_utils
DrawingSpec = DrawingUtils.DrawingSpec
RunningMode = mp.tasks.vision.RunningMode

# Conexiones para dibujar la malla
TESSELATION_CONNECTIONS = FaceLandmarksConnections.FACE_LANDMARKS_TESSELATION
CONTOUR_CONNECTIONS = FaceLandmarksConnections.FACE_LANDMARKS_CONTOURS


def draw_face_mesh(image, face_landmarks):
    """Dibuja la malla facial sobre la imagen usando las conexiones de tesselation."""
    h, w, _ = image.shape

    # Convertir landmarks normalizados a píxeles
    points = []
    for lm in face_landmarks:
        px = int(lm.x * w)
        py = int(lm.y * h)
        points.append((px, py))

    # Dibujar las líneas de la tesselation
    for conn in TESSELATION_CONNECTIONS:
        pt1 = points[conn.start]
        pt2 = points[conn.end]
        cv2.line(image, pt1, pt2, (200, 200, 200), 1, cv2.LINE_AA)

    # Dibujar contornos (ojos, labios, cejas) más gruesos y verdes
    for conn in CONTOUR_CONNECTIONS:
        pt1 = points[conn.start]
        pt2 = points[conn.end]
        cv2.line(image, pt1, pt2, (0, 255, 0), 2, cv2.LINE_AA)


def main():
    print("=" * 50)
    print("  GRABADOR DE EXPRESIONES FACIALES")
    print("=" * 50)
    print("Presiona las teclas para grabar cada vocal:")
    print("  A  E  I  O  U")
    print("Presiona Q para salir y guardar.")
    print("=" * 50)

    # Crear el FaceLandmarker
    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='face_landmarker.task'),
        running_mode=RunningMode.VIDEO,
        num_faces=1,
        min_face_detection_confidence=0.5,
        min_face_presence_confidence=0.5,
        min_tracking_confidence=0.5,
        output_face_blendshapes=False,
        output_facial_transformation_matrixes=False,
    )

    landmarker = FaceLandmarker.create_from_options(options)
    cap = cv2.VideoCapture(0)
    saved_landmarks = {}
    frame_ts = 0

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            continue

        frame_ts += 33  # ~30fps en milisegundos

        # Convertir BGR -> RGB para MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        # Detectar landmarks
        result = landmarker.detect_for_video(mp_image, frame_ts)

        current_landmarks = None
        display = frame.copy()

        if result.face_landmarks:
            face_lms = result.face_landmarks[0]
            current_landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in face_lms]
            draw_face_mesh(display, face_lms)

        # Voltear para vista espejo
        display = cv2.flip(display, 1)

        # Info en pantalla
        saved_str = ", ".join(sorted(saved_landmarks.keys())) if saved_landmarks else "ninguna"
        cv2.putText(display, f"Guardadas: {saved_str}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(display, "Teclas: A E I O U | Q=salir", (10, 65),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        if not current_landmarks:
            cv2.putText(display, "NO SE DETECTA CARA", (10, 100),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        cv2.imshow('Grabador de Expresiones', display)

        key = cv2.waitKey(5) & 0xFF

        if key in [ord('a'), ord('e'), ord('i'), ord('o'), ord('u')]:
            vowel = chr(key).upper()
            if current_landmarks:
                saved_landmarks[vowel] = current_landmarks
                print(f"  ✓ Vocal '{vowel}' guardada! ({len(current_landmarks)} puntos)")
            else:
                print(f"  ✗ No se detectó cara, intenta de nuevo para '{chr(key).upper()}'")

        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    landmarker.close()

    # Guardar
    if saved_landmarks:
        with open('landmarks.json', 'w') as f:
            json.dump(saved_landmarks, f)
        print(f"\n✓ Datos guardados en 'landmarks.json' ({len(saved_landmarks)} vocales)")
    else:
        print("\n✗ No se guardó ninguna vocal.")


if __name__ == '__main__':
    main()
