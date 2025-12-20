from flask import Flask, request, jsonify, send_file, render_template_string
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import os
import uuid
import json
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load YOLO model
model = YOLO("best.pt")

# Create upload/result folders
UPLOAD_FOLDER = "uploads"
RESULTS_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Load fertilizer database
with open("fertilizer_data.json", "r") as f:
    fertilizer_db = json.load(f)

# ---------------------------
# Home page
# ---------------------------
@app.route("/")
def home():
    return render_template_string("""
        <h2>🚀 YOLOv11 Flask API with Fertilizer Recommendation</h2>
        <p>Upload an image to detect weeds and get fertilizer suggestions.</p>
        <form action="/predict" method="post" enctype="multipart/form-data">
            <input type="file" name="file">
            <input type="submit" value="Upload & Detect">
        </form>
    """)

# ---------------------------
# Prediction API
# ---------------------------
@app.route("/predict", methods=["POST"])
def predict():
    if "file" in request.files:
        file = request.files["file"]
    elif "image" in request.files:
        file = request.files["image"]
    else:
        return jsonify({"error": "No image uploaded"}), 400

    if file.filename == "":
        return jsonify({"error": "No image selected"}), 400

    filename = secure_filename(file.filename)
    if not filename:
        filename = str(uuid.uuid4()) + ".jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run YOLO
    results = model(filepath)

    img = cv2.imread(filepath)
    detections = []

    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        label = results[0].names[cls_id]
        conf = float(box.conf[0])

        # Fetch fertilizer info from JSON
        fert_info = fertilizer_db.get(label, {
            "fertilizer": "Not found",
            "quantity": "N/A",
            "frequency": "N/A"
        })

        detections.append({
            "label": label,
            "confidence": round(conf * 100, 2),
            "fertilizer": fert_info["fertilizer"],
            "quantity": fert_info["quantity"],
            "frequency": fert_info["frequency"]
        })

        # Draw box + label
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        text = f"{label} {conf*100:.1f}%"
        cv2.putText(img, text, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

    # Save result image
    result_filename = f"result_{filename}"
    result_path = os.path.join(RESULTS_FOLDER, result_filename)
    cv2.imwrite(result_path, img)

    base_url = request.host_url.rstrip("/")

    return jsonify({
        "detections": detections,
        "result_image_url": f"{base_url}/result/{result_filename}",
        "original_image_url": f"{base_url}/uploads/{filename}"
    })

# ---------------------------
# Routes for serving images
# ---------------------------
@app.route("/result/<filename>")
def result_image(filename):
    return send_file(os.path.join(RESULTS_FOLDER, filename), mimetype="image/jpeg")

@app.route("/uploads/<filename>")
def uploaded_image(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename), mimetype="image/jpeg")

# ---------------------------
# Run app
# ---------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
