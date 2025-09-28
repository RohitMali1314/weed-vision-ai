# Flask Backend Setup for Weed Detection

This frontend is ready to integrate with your Flask backend. Here's what you need to implement:

## Backend Requirements

### 1. Install Dependencies
```bash
pip install flask flask-cors ultralytics pillow numpy opencv-python
```

### 2. Flask API Implementation

Create `app.py`:

```python
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load your trained model
model = YOLO('best.pt')  # Your trained YOLOv11 model

# Create directories
os.makedirs('uploads', exist_ok=True)
os.makedirs('results', exist_ok=True)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Save uploaded image
    filename = str(uuid.uuid4()) + '.jpg'
    filepath = os.path.join('uploads', filename)
    file.save(filepath)
    
    # Run prediction
    results = model(filepath)
    
    # Process results
    detections = []
    for r in results:
        boxes = r.boxes
        if boxes is not None:
            for box in boxes:
                # Extract detection info
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                label = model.names[class_id]
                
                detections.append({
                    'label': label,
                    'confidence': round(confidence * 100, 1),
                    'bbox': [float(x1), float(y1), float(x2), float(y2)]
                })
    
    # Draw bounding boxes and save result
    image = cv2.imread(filepath)
    for detection in detections:
        x1, y1, x2, y2 = [int(coord) for coord in detection['bbox']]
        label = detection['label']
        confidence = detection['confidence']
        
        # Draw bounding box
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        # Add label with confidence
        label_text = f"{label} {confidence}%"
        cv2.putText(image, label_text, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Save result image
    result_filename = f"result_{filename}"
    result_path = os.path.join('results', result_filename)
    cv2.imwrite(result_path, image)
    
    return jsonify({
        'detections': detections,
        'result_image_url': f'http://localhost:5000/result/{result_filename}',
        'original_image_url': f'http://localhost:5000/uploads/{filename}'
    })

@app.route('/result/<filename>')
def get_result(filename):
    return send_from_directory('results', filename)

@app.route('/uploads/<filename>')
def get_upload(filename):
    return send_from_directory('uploads', filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

### 3. Run the Backend

```bash
python app.py
```

The backend will run on `http://localhost:5000`

## Deployment Options

### Render.com
1. Create `requirements.txt`:
```
flask
flask-cors
ultralytics
pillow
numpy
opencv-python-headless
```

2. Create `render.yaml`:
```yaml
services:
  - type: web
    name: weed-detection-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: PORT
        value: 10000
```

### Railway
1. Install Railway CLI and deploy:
```bash
railway login
railway init
railway up
```

### Heroku
1. Create `Procfile`:
```
web: python app.py
```

2. Deploy:
```bash
git init
heroku create your-app-name
git add .
git commit -m "Initial commit"
git push heroku main
```

## Frontend Integration

The frontend is already configured to work with your Flask backend. Just make sure to:

1. Update the API URL in `src/pages/Index.tsx` if deploying to production
2. Handle CORS properly in your Flask app
3. Ensure your `best.pt` model file is in the same directory as `app.py`

## Testing

1. Start your Flask backend
2. Upload an image through the frontend
3. Check that predictions are returned and displayed correctly

Your weed detection system is now ready to use!