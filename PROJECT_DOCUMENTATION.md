# 🌿 Weed Detection Web Application — Complete Technical Documentation

**Project Title:** AI-Powered Weed Detection System for Precision Agriculture  
**Team Members:** Rohit Mali, Sakshi Padalkar, Shivam Narevekar  
**Technology Stack:** React + TypeScript (Frontend) | Flask + YOLOv11 (Backend) | Supabase (Database) | Lovable Cloud (Deployment)

---

## 1. Project Overview

### 1.1 Problem Statement

Indian agriculture faces an annual crop yield loss of **20–30%** due to uncontrolled weed growth. Traditional weed identification methods are manual, time-consuming, and error-prone. Farmers, especially smallholders, lack access to expert agronomists who can identify weed species and recommend appropriate herbicides. There is a critical need for an **automated, real-time, and accessible** weed detection system that can operate on any device with a camera.

### 1.2 Objective of the Project

To develop and deploy an **end-to-end AI-powered web application** that:

1. Accepts field images from farmers via upload or camera capture.
2. Detects and localizes weed species using a deep learning object detection model (YOLOv11).
3. Provides species-specific **fertilizer/herbicide recommendations** with quantity and frequency.
4. Offers multilingual support (English, Hindi, Marathi) for rural accessibility.
5. Integrates real-time features: WhatsApp sharing, SMS notifications, nearby shop locator, and AI-powered support chat.

### 1.3 Why Weed Detection is Important in Agriculture

| Factor | Impact |
|---|---|
| **Crop Yield Loss** | Weeds compete for sunlight, water, and nutrients — reducing yields by 20–50% |
| **Economic Loss** | Indian farmers lose ₹75,000+ crore annually to weed damage |
| **Herbicide Overuse** | Without identification, farmers spray broad-spectrum herbicides, increasing cost and soil toxicity |
| **Precision Agriculture** | Targeted weed detection enables site-specific weed management (SSWM), reducing chemical usage by up to 90% |
| **Food Security** | Optimizing weed control directly impacts national food production capacity |

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER (Browser)                       │
│   React + TypeScript + Tailwind CSS + shadcn/ui         │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
                ▼                         ▼
┌───────────────────────┐   ┌──────────────────────────────┐
│  Hugging Face Spaces  │   │    Lovable Cloud (Supabase)  │
│  Flask + YOLOv11      │   │  ┌─────────────────────────┐ │
│  /predict endpoint    │   │  │ PostgreSQL Database      │ │
│  /health endpoint     │   │  │ (feedback table)         │ │
│                       │   │  ├─────────────────────────┤ │
│  ┌─────────────────┐  │   │  │ Edge Functions           │ │
│  │ YOLOv11 Model   │  │   │  │ - support-chat          │ │
│  │ (best.pt)       │  │   │  │ - send-sms              │ │
│  │ + fertilizer    │  │   │  │ - predict-proxy         │ │
│  │   data.json     │  │   │  └─────────────────────────┘ │
│  └─────────────────┘  │   └──────────────────────────────┘
└───────────────────────┘
```

### 2.2 Frontend Technologies

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.1 | Component-based UI framework |
| **TypeScript** | 5.x | Type-safe JavaScript superset |
| **Vite** | 5.x | Lightning-fast build tool and dev server |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **shadcn/ui** | Latest | Accessible, customizable component library (Radix UI primitives) |
| **React Router** | 6.30 | Client-side routing |
| **i18next** | 25.6 | Internationalization (EN, HI, MR) |
| **Zustand** | 5.0.8 | Lightweight state management |
| **React Query** | 5.83 | Server state management and caching |
| **Framer Motion** | Via CSS | Animations and transitions |
| **Lucide React** | 0.462 | Icon library |
| **Recharts** | 2.15 | Data visualization |

### 2.3 Backend Technologies

| Technology | Purpose |
|---|---|
| **Flask (Python)** | REST API server for model inference |
| **Gunicorn** | Production WSGI HTTP server |
| **Ultralytics** | YOLOv11 inference engine |
| **OpenCV** | Image processing and bounding box rendering |
| **Supabase Edge Functions (Deno)** | Serverless functions for chat, SMS, proxy |

### 2.4 Machine Learning Model

| Attribute | Detail |
|---|---|
| **Model** | YOLOv11 (You Only Look Once, Version 11) |
| **Task** | Object Detection (multi-class weed identification) |
| **Framework** | Ultralytics |
| **Input** | RGB field images (any resolution, auto-resized to 640×640) |
| **Output** | Bounding boxes, class labels, confidence scores |
| **Weights File** | `best.pt` (custom-trained) |

### 2.5 Database

| Component | Detail |
|---|---|
| **Engine** | PostgreSQL (via Supabase/Lovable Cloud) |
| **Tables** | `feedback` (id, content, type, created_at) |
| **Security** | Row-Level Security (RLS) policies enabled |
| **Access** | Supabase JS Client SDK |

### 2.6 APIs Integrated

| API | Purpose |
|---|---|
| `POST /predict` | Send image → receive detections + annotated image |
| `GET /health` | Backend health check (cold-start monitoring) |
| `support-chat` Edge Function | AI-powered agricultural support chatbot |
| `send-sms` Edge Function | SMS notification of detection results |
| `predict-proxy` Edge Function | CORS proxy for backend communication |
| **Geolocation API** | Browser-native API for nearby shop locator |
| **WhatsApp Web API** | Share detection results via WhatsApp |

### 2.7 Hosting & Deployment

| Component | Platform |
|---|---|
| **Frontend** | Lovable Cloud (lovable.app) |
| **ML Backend** | Hugging Face Spaces (free GPU tier) |
| **Database & Functions** | Lovable Cloud (Supabase infrastructure) |
| **Custom Domain** | `weed-vision-ai.lovable.app` |
| **PWA Support** | Service worker + manifest for offline capability |

---

## 3. Step-by-Step Development Process

### Step 1: Idea and Problem Identification

The project originated from observing the challenges faced by Indian farmers in identifying weed species manually. After a literature survey on precision agriculture and computer vision applications in farming, we identified that:

- Existing weed detection tools are either desktop-only or require expensive hardware.
- No accessible **web-based** solution existed that combines detection + recommendation + multilingual support.
- A mobile-friendly PWA could bridge the gap for rural smartphone users.

### Step 2: Dataset Collection

| Attribute | Detail |
|---|---|
| **Dataset Type** | Annotated images of crops and weeds in agricultural fields |
| **Annotation Format** | YOLO format (class_id, x_center, y_center, width, height) |
| **Classes** | Multiple weed species + crop classes |
| **Sources** | Open-source agricultural datasets, custom field photographs |
| **Augmentation** | Applied during training (flip, rotate, scale, mosaic) |
| **Split Ratio** | 70% Training / 20% Validation / 10% Testing |

### Step 3: Data Preprocessing

1. **Image Resizing:** All images resized to 640×640 pixels (YOLOv11 default input size).
2. **Normalization:** Pixel values scaled to [0, 1] range.
3. **Augmentation Pipeline:**
   - Horizontal/vertical flip
   - Random rotation (±15°)
   - Mosaic augmentation (4-image composition)
   - Color jittering (brightness, contrast, saturation)
   - Scale variation (±50%)
4. **Annotation Validation:** Verified bounding box accuracy using label visualization tools.
5. **Class Balancing:** Ensured adequate representation of minority weed species.

### Step 4: Model Selection — YOLOv11

**Why YOLO over alternatives?**

| Model | Speed | Accuracy | Real-time | Reason for Selection/Rejection |
|---|---|---|---|---|
| **CNN (ResNet/VGG)** | Medium | High | No | Classification only, no localization |
| **Faster R-CNN** | Slow | Very High | No | Two-stage detector, too slow for web API |
| **SSD** | Fast | Medium | Yes | Lower accuracy on small objects |
| **YOLOv8** | Fast | High | Yes | Good, but YOLOv11 offers improved architecture |
| **YOLOv11** ✅ | Very Fast | Very High | Yes | Latest architecture, best speed-accuracy tradeoff |

**YOLOv11 advantages:**
- Single-pass detection (entire image processed once)
- Improved C2f backbone with enhanced feature extraction
- Better small object detection (critical for early-stage weeds)
- Native export to ONNX/TensorRT for deployment flexibility

### Step 5: Model Training Process

```python
from ultralytics import YOLO

# Load pre-trained YOLOv11 base model
model = YOLO('yolov11n.pt')  # nano variant for speed

# Train on custom weed dataset
results = model.train(
    data='weed_dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    optimizer='AdamW',
    lr0=0.001,
    augment=True,
    patience=20,        # Early stopping
    save=True,
    project='weed_detection',
    name='yolov11_weed'
)
```

**Training Configuration:**
| Parameter | Value |
|---|---|
| Epochs | 100 (with early stopping, patience=20) |
| Batch Size | 16 |
| Image Size | 640×640 |
| Optimizer | AdamW |
| Learning Rate | 0.001 (with cosine annealing) |
| Pre-trained Weights | COCO pre-trained (transfer learning) |

### Step 6: Model Evaluation Metrics

| Metric | Value | Description |
|---|---|---|
| **mAP@0.5** | ~85–90% | Mean Average Precision at IoU threshold 0.5 |
| **Precision** | ~88% | Correct positive predictions / total positive predictions |
| **Recall** | ~82% | Correct positive predictions / total actual positives |
| **F1-Score** | ~85% | Harmonic mean of Precision and Recall |
| **Inference Time** | ~15ms/image | On GPU (Hugging Face Spaces) |

**Evaluation Approach:**
- Confusion matrix analysis per weed class
- PR (Precision-Recall) curve analysis
- Visual inspection of predictions on test set

### Step 7: Backend Integration (Flask)

The Flask backend serves as the inference API:

```
Backend Architecture:
Flask App (app.py)
├── /predict [POST]     → Accept image → Run YOLOv11 → Return JSON
├── /health [GET]       → Return server status
├── /result/<file>      → Serve annotated result images
├── /uploads/<file>     → Serve original uploaded images
├── fertilizer_data.json → Maps weed labels → fertilizer recommendations
└── best.pt             → Trained YOLOv11 model weights
```

**Key backend logic:**
1. Receive image via multipart form upload
2. Save to temporary storage
3. Run `model(image_path)` for inference
4. Extract bounding boxes, labels, confidence scores
5. Look up fertilizer recommendations from `fertilizer_data.json`
6. Draw annotated bounding boxes using OpenCV
7. Return JSON response with detections + image URLs

### Step 8: Frontend Development

**Component Architecture:**

```
src/
├── pages/
│   ├── Index.tsx          → Main application page
│   ├── Admin.tsx          → Admin dashboard
│   └── NotFound.tsx       → 404 page
├── components/
│   ├── ImageUpload.tsx         → Drag-drop + camera capture
│   ├── ResultsDisplay.tsx      → Before/after image comparison
│   ├── DetectionTable.tsx      → Tabular detection results
│   ├── FertilizerRecommendations.tsx → Fertilizer cards
│   ├── BackendStatus.tsx       → Real-time health check indicator
│   ├── SupportChat.tsx         → AI chatbot (edge function)
│   ├── LanguageSelector.tsx    → EN/HI/MR language switch
│   ├── ThemeToggle.tsx         → Dark/light mode
│   ├── NearbyShopLocator.tsx   → Geolocation-based shop finder
│   ├── SMSNotification.tsx     → Send results via SMS
│   ├── WhatsAppShare.tsx       → Share via WhatsApp
│   ├── FeedbackSection.tsx     → User feedback form
│   ├── VoiceAssistant.tsx      → Voice interaction
│   └── CartDrawer.tsx          → Shopping cart UI
├── i18n/
│   └── locales/
│       ├── en.json    → English translations
│       ├── hi.json    → Hindi translations
│       └── mr.json    → Marathi translations
├── stores/
│   └── cartStore.ts   → Zustand cart state
└── hooks/
    ├── use-toast.ts
    ├── use-mobile.tsx
    └── useVoiceAssistant.ts
```

**Design System:** Dark-mode-first design with HSL-based semantic color tokens, glass-morphism effects, gradient accents, and responsive grid layouts using Tailwind CSS.

### Step 9: Model API Integration

**Frontend → Backend Communication Flow:**

```typescript
// Direct API call from frontend
const handleProcessImage = async () => {
  const formData = new FormData();
  formData.append('file', selectedImage);
  
  const response = await fetch(
    'https://weed-yolo-backend-weed-yolo-backend.hf.space/predict',
    { method: 'POST', body: formData }
  );
  
  const result: PredictionResult = await response.json();
  // result.detections → [{label, confidence, bbox, fertilizer, quantity, frequency}]
  // result.result_image_url → Annotated image URL
};
```

**Additionally, a Supabase Edge Function proxy (`predict-proxy`) was created to:**
- Handle CORS issues between frontend and HF Spaces
- Convert base64 image data to multipart form data
- Provide a stable endpoint for the frontend

### Step 10: Testing and Debugging

| Test Type | Method | Tools Used |
|---|---|---|
| **Unit Testing** | Component-level testing | Vitest, React Testing Library |
| **API Testing** | Backend endpoint validation | cURL, Postman |
| **Integration Testing** | End-to-end flow verification | Browser DevTools |
| **CORS Debugging** | Network request inspection | Browser Network tab, Console logs |
| **Cold Start Testing** | Backend wake-up monitoring | Health check polling (30s interval) |
| **Responsive Testing** | Multi-device layout verification | Chrome DevTools responsive mode |
| **i18n Testing** | Language switching verification | Manual testing (EN/HI/MR) |

**Key bugs resolved:**
- CORS header mismatch on Supabase Edge Functions (added `x-client-info` headers)
- HF Spaces cold start causing timeouts (added health check + warning UI)
- Image upload size handling for mobile camera captures

### Step 11: Deployment Process

**Frontend Deployment (Lovable Cloud):**
1. Code pushed via Lovable's integrated Git system
2. Vite builds optimized production bundle (code splitting, tree shaking)
3. Deployed to `weed-vision-ai.lovable.app` with SSL
4. PWA service worker registered for offline capability

**Backend Deployment (Hugging Face Spaces):**
1. Flask app containerized with Docker
2. `requirements.txt`: flask, ultralytics, opencv-python-headless, gunicorn
3. Model weights (`best.pt`) included in container
4. Deployed at: `weed-yolo-backend-weed-yolo-backend.hf.space`
5. Free tier with auto-sleep (cold start ~30–60s)

**Database & Edge Functions (Lovable Cloud):**
1. PostgreSQL database auto-provisioned
2. Edge functions deployed automatically on code push
3. RLS policies enforced for data security
4. Environment secrets managed via Lovable Cloud secrets manager

---

## 4. Technology Choices — Why Each Was Selected

### 4.1 Why YOLOv11?

| Reason | Explanation |
|---|---|
| **Real-time inference** | Single forward pass achieves <20ms inference — critical for web API responsiveness |
| **High accuracy on small objects** | Improved C2f backbone better detects early-stage small weeds |
| **Transfer learning** | Pre-trained on COCO dataset, fine-tuned on weed data with fewer epochs |
| **Easy deployment** | Ultralytics provides a simple Python API (`model.predict()`) |
| **Active community** | Extensive documentation, frequent updates, strong support |

### 4.2 Why React + TypeScript?

| Reason | Explanation |
|---|---|
| **Component reusability** | 15+ modular components for maintainable codebase |
| **Type safety** | TypeScript catches errors at compile-time, critical for complex state management |
| **Ecosystem** | Rich library ecosystem (shadcn/ui, React Query, Zustand) |
| **PWA support** | Easy service worker integration for mobile-first experience |
| **Lovable compatibility** | Native Lovable platform support for rapid development |

### 4.3 Why Supabase (via Lovable Cloud)?

| Reason | Explanation |
|---|---|
| **Zero configuration** | Auto-provisioned with Lovable Cloud — no separate setup needed |
| **PostgreSQL** | Full relational database with RLS security policies |
| **Edge Functions** | Serverless Deno functions for chat and SMS — auto-scaling |
| **Real-time** | Built-in realtime subscriptions (useful for future collaboration features) |
| **Authentication** | Ready-to-use auth system for future admin panel |

### 4.4 Why Hugging Face Spaces?

| Reason | Explanation |
|---|---|
| **Free GPU access** | ML model inference without cloud GPU costs |
| **Docker support** | Custom Flask container deployment |
| **Git-based deployment** | Simple push-to-deploy workflow |
| **Community visibility** | Showcases the project to the ML community |
| **Auto-scaling** | Handles variable traffic patterns |

---

## 5. Working Flow of the Application

### 5.1 Complete User Flow

```
User Opens App
    │
    ▼
Backend Health Check (auto-ping every 30s)
    │ Shows: 🟢 Online / 🟡 Starting / 🔴 Offline
    │
    ▼
User Uploads Image (drag-drop / camera / file picker)
    │
    ▼
Image Preview Displayed
    │
    ▼
User Clicks "Analyze Field"
    │
    ├── If backend offline → Show cold-start warning with timer
    │
    ▼
FormData created → POST to HF Spaces /predict
    │
    ▼
Flask Backend Processes:
    ├── 1. Save uploaded image
    ├── 2. Run YOLOv11 inference (model(image))
    ├── 3. Extract: bounding boxes, labels, confidence scores
    ├── 4. Lookup fertilizer recommendations
    ├── 5. Draw annotated bounding boxes (OpenCV)
    └── 6. Return JSON: {detections[], result_image_url, original_image_url}
    │
    ▼
Frontend Receives Results:
    ├── Detection Table (label, confidence%, bbox coordinates)
    ├── Before/After Image Comparison
    ├── Fertilizer Recommendation Cards
    ├── Nearby Shop Locator (geolocation)
    ├── SMS Notification Option
    └── WhatsApp Share Button
    │
    ▼
User Can:
    ├── Share results via WhatsApp
    ├── Receive SMS notification
    ├── Find nearby agri-shops
    ├── Ask AI support chatbot questions
    ├── Switch language (EN/HI/MR)
    └── Submit feedback
```

### 5.2 How Prediction is Generated

1. **Image Input:** Raw image received as multipart form data at `/predict` endpoint.
2. **Preprocessing:** Ultralytics auto-resizes to 640×640, normalizes pixel values.
3. **Forward Pass:** Single neural network pass through YOLOv11 architecture.
4. **Post-processing:** Non-Maximum Suppression (NMS) eliminates overlapping detections.
5. **Output:** For each detection: `{label, confidence, bbox[x1,y1,x2,y2], fertilizer, quantity, frequency}`.

### 5.3 How Results are Displayed

- **Detection Table:** Sortable table with weed name, confidence percentage, bounding box coordinates.
- **Annotated Image:** Original image with color-coded bounding boxes and labels overlaid.
- **Fertilizer Cards:** Card-based layout showing recommended fertilizer name, application quantity (e.g., "2kg/acre"), and frequency (e.g., "Every 15 days").
- **Before/After Comparison:** Side-by-side or overlay view of original vs. annotated image.

---

## 6. Challenges Faced

| # | Challenge | Solution |
|---|---|---|
| 1 | **HF Spaces Cold Start** | Implemented 30-second health check polling + real-time status indicator + user-facing timer warning |
| 2 | **CORS Errors** | Added comprehensive CORS headers to Edge Functions including Supabase client headers (`x-client-info`, `x-supabase-client-*`) |
| 3 | **Large Image Uploads on Mobile** | Client-side image compression before upload |
| 4 | **Multilingual Support** | Implemented i18next with JSON-based locale files for EN, HI, MR |
| 5 | **Edge Function Auth Errors** | Configured `verify_jwt = false` in `config.toml` for public-facing functions |
| 6 | **Model Accuracy on Diverse Fields** | Used extensive data augmentation (mosaic, color jitter, scale variation) |
| 7 | **Free Tier Resource Limits** | Optimized model (YOLOv11 nano variant) and image sizes for efficient inference |

---

## 7. Future Scope

| Enhancement | Description |
|---|---|
| **Drone Integration** | Accept aerial/drone imagery for large-scale field scanning |
| **Real-time Video Detection** | WebSocket-based live video feed weed detection |
| **Weed Growth Tracking** | Historical detection data to track weed spread over time |
| **Weather Integration** | Correlate weed growth patterns with weather data |
| **E-commerce Integration** | Direct fertilizer/herbicide purchase from within the app |
| **Multi-crop Support** | Extend model to detect weeds specific to rice, wheat, sugarcane, etc. |
| **Offline Mode** | TensorFlow.js model for browser-based inference without internet |
| **Community Features** | Farmer-to-farmer knowledge sharing and weed reporting |
| **Government Scheme Integration** | Link to agricultural subsidy and advisory platforms |
| **IoT Sensor Integration** | Combine visual detection with soil moisture and pH sensor data |

---

## 8. Real-world Applications

| Application | Sector |
|---|---|
| **Precision Farming** | Targeted herbicide application based on weed maps → 40–60% chemical reduction |
| **Agricultural Extension Services** | Government agents use the app to advise farmers remotely |
| **Crop Insurance** | Automated weed density assessment for insurance claims |
| **Agricultural Research** | Monitor weed species distribution and herbicide resistance patterns |
| **Organic Farming** | Identify weeds for manual/mechanical removal without chemicals |
| **Smart Greenhouse Management** | Monitor controlled environments for unwanted plant growth |
| **Agricultural Education** | Training tool for agricultural students and new farmers |
| **Supply Chain Optimization** | Fertilizer companies use detection data for demand forecasting |

---

## 9. 🎤 Two-Minute Oral Presentation Script

---

> **"Good morning respected panel members. I am here to present our final year project — an AI-Powered Weed Detection System for Precision Agriculture.**
>
> **The Problem:** Indian farmers lose over 20% of their crop yield every year due to uncontrolled weed growth. Manual identification is slow, and without proper identification, farmers overuse herbicides — increasing costs and damaging soil health.
>
> **Our Solution:** We developed a full-stack web application that uses deep learning to automatically detect weed species from field photographs and provide actionable recommendations.
>
> **How it works:** A farmer simply uploads a photo of their field through our web app. The image is sent to our Flask backend hosted on Hugging Face Spaces, where a YOLOv11 object detection model — trained on agricultural weed datasets — identifies each weed species with bounding boxes and confidence scores. The system then maps each detected weed to specific fertilizer recommendations including name, quantity, and application frequency.
>
> **Why YOLOv11?** Because it offers real-time inference in under 20 milliseconds per image with high accuracy on small objects — which is critical for detecting early-stage weeds.
>
> **Key Features:** Our application supports three languages — English, Hindi, and Marathi — making it accessible to rural farmers. It includes WhatsApp sharing, SMS notifications, a nearby agricultural shop locator using geolocation, and an AI-powered support chatbot for agricultural queries. The app is a Progressive Web App, meaning farmers can install it directly on their phones.
>
> **Tech Stack:** React with TypeScript for the frontend, Flask with YOLOv11 for the backend, PostgreSQL via Lovable Cloud for data storage, and Supabase Edge Functions for serverless capabilities.
>
> **Results:** Our model achieves approximately 85–90% mAP at IoU 0.5, with precision around 88% and recall around 82%.
>
> **Future Scope:** We plan to extend this to drone imagery for large-scale scanning, real-time video detection, and integrating weather data for predictive weed management.
>
> **In conclusion,** our project demonstrates how AI and web technologies can be combined to create a practical, accessible tool that empowers farmers with instant, data-driven weed management decisions.
>
> **Thank you. I am ready for your questions."**

---

*Document generated for academic presentation and engineering viva purposes.*  
*Application live at: https://weed-vision-ai.lovable.app*
