import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

mp_face_detection = mp.solutions.face_detection

# Function to detect skin tone
def get_skin_tone(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return "Error: Unable to read image"

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_detection = mp_face_detection.FaceDetection(min_detection_confidence=0.5)
    results = face_detection.process(image_rgb)

    if not results.detections:
        return "No face detected"

    # Get bounding box of the first detected face
    detection = results.detections[0]
    bboxC = detection.location_data.relative_bounding_box
    h, w, _ = image.shape
    x_min, y_min = int(bboxC.xmin * w), int(bboxC.ymin * h)
    box_w, box_h = int(bboxC.width * w), int(bboxC.height * h)

    # Extract skin tone from cheek area
    cheek_x = x_min + box_w // 2
    cheek_y = y_min + int(0.75 * box_h)
    sample_size = 10  # Pixels to sample
    skin_patch = image[cheek_y:cheek_y + sample_size, cheek_x:cheek_x + sample_size]

    if skin_patch.size == 0:
        return "Could not extract skin tone"

    avg_color = np.mean(skin_patch, axis=(0, 1))  # Get average BGR color
    avg_color_rgb = avg_color[::-1]  # Convert BGR to RGB

    # Determine skin tone category
    r, g, b = avg_color_rgb
    if r > 180 and g > 140 and b > 120:
        return "light"
    elif r > 140 and g > 100 and b > 80:
        return "medium"
    else:
        return "dark"

# Handle image uploads and detect skin tone
@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files['image']
    image_path = "temp_image.jpg"
    image.save(image_path)

    skin_tone = get_skin_tone(image_path)

    return jsonify({"skin_tone": skin_tone})

# Recommend products based on skin tone
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    skin_tone = data.get("skin_tone", "medium")

    recommendations = {
        "light": [
            {"id": 1, "name": "Foundation Light A", "link": "https://example.com/light1"},
            {"id": 2, "name": "Foundation Light B", "link": "https://example.com/light2"},
        ],
        "medium": [
            {"id": 3, "name": "Foundation Medium A", "link": "https://example.com/medium1"},
            {"id": 4, "name": "Foundation Medium B", "link": "https://example.com/medium2"},
        ],
        "dark": [
            {"id": 5, "name": "Foundation Dark A", "link": "https://example.com/dark1"},
            {"id": 6, "name": "Foundation Dark B", "link": "https://example.com/dark2"},
        ],
    }

@app.route('/full-makeup-recommend', methods=['POST'])
def full_makeup_recommend():
    data = request.get_json()
    skin_tone = data.get("skin_tone", "medium")
    makeup_style = data.get("makeupStyle", "natural")
    skin_type = data.get("skinType", "combination")
    finish = data.get("finish", "matte")

    # Example makeup recommendations based on quiz + skin tone
    recommendations = {
        "foundation": {
            "light": "Foundation Light - " + ("Matte" if finish == "matte" else "Dewy"),
            "medium": "Foundation Medium - " + ("Matte" if finish == "matte" else "Dewy"),
            "dark": "Foundation Dark - " + ("Matte" if finish == "matte" else "Dewy"),
        },
        "blush": {
            "light": "Soft Pink Blush",
            "medium": "Peach Blush",
            "dark": "Deep Rose Blush",
        },
        "lipstick": {
            "natural": "Nude Lipstick",
            "glam": "Red Lipstick",
            "bold": "Dark Berry Lipstick",
        },
        "lip balm": "Hydrating Lip Balm",
        "contour": {
            "light": "Light Contour Stick",
            "medium": "Medium Contour Stick",
            "dark": "Dark Contour Stick",
        },
        "setting spray": {
            "oily": "Matte Setting Spray",
            "dry": "Hydrating Setting Spray",
            "combination": "Long-lasting Setting Spray",
        }
    }

    # Create final recommendations
    final_recommendations = [
        {"id": 1, "name": recommendations["foundation"][skin_tone], "link": "#"},
        {"id": 2, "name": recommendations["blush"][skin_tone], "link": "#"},
        {"id": 3, "name": recommendations["lipstick"][makeup_style], "link": "#"},
        {"id": 4, "name": recommendations["lip balm"], "link": "#"},
        {"id": 5, "name": recommendations["contour"][skin_tone], "link": "#"},
        {"id": 6, "name": recommendations["setting spray"][skin_type], "link": "#"},
    ]

    return jsonify({"recommendations": final_recommendations})

if __name__ == '__main__':
    app.run(debug=True)
