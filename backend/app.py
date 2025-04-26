from flask import Flask, request, jsonify
import joblib
import numpy as np
from pymongo import MongoClient
import os
import psutil
import traceback
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS

# === MongoDB Connection ===
MONGO_URI = "mongodb+srv://chendusoundharya:q0mtL8iYFlw10rvI@mental-health-cluster.ixrz2.mongodb.net/?retryWrites=true&w=majority&appName=mental-health-cluster"
client = MongoClient(MONGO_URI)
db = client["mental_health_db"]

# === Collections ===
users_collection = db["users"]
responses_collection = db["questionnaire_responses"]
predictions_collection = db["predictions"]
chat_collection = db["chat_history"]

# === Load ML Model ===
try:
    model = joblib.load('model.pkl')
    print("✅ Model loaded.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# === Load Label Encoders (only required ones) ===
label_encoders = {}
encoder_dir = "label_encoders"

required_fields = [
    'mood', 'sleep', 'energy', 'appetite', 'interest',
    'irritability', 'concentration', 'feelingWorthy',
    'anxiousThoughts', 'panicAttacks'
]

try:
    if os.path.exists(encoder_dir):
        for field in required_fields:
            filepath = os.path.join(encoder_dir, f"{field}_label_encoder.joblib")
            if os.path.exists(filepath):
                encoder = joblib.load(filepath)
                label_encoders[field] = encoder
        print("✅ Label encoders loaded.")
    else:
        print("⚠️ 'label_encoders/' directory not found.")
except Exception as e:
    print(f"❌ Error loading label encoders: {e}")

# === Prediction API ===
@app.route('/submit', methods=['POST'])
def submit():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.json
        print(f"📥 Received data: {data}")

        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        input_vector = []
        for field in required_fields:
            value = data[field]
            if field in label_encoders:
                try:
                    encoded_value = label_encoders[field].transform([value])[0]
                except ValueError:
                    encoded_value = 0  # Unknown fallback
            else:
                fallback_map = {
                    "Low": 1, "Moderate": 2, "High": 3,
                    "Neutral": 3, "Somewhat": 2, "Normal": 3,
                    "Somewhat Irritable": 2, "Sometimes": 2, "No": 0
                }
                encoded_value = fallback_map.get(value, 0)
            input_vector.append(encoded_value)

        features = np.array(input_vector).reshape(1, -1)
        prediction = model.predict(features)

        # Save in DB
        responses_collection.insert_one(data)
        predictions_collection.insert_one({
            "user_id": data.get("user_id", "unknown"),
            "features": data,
            "prediction": prediction.tolist()
        })

        return jsonify({'prediction': prediction.tolist()})

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# === Get Predictions by User ===
@app.route('/get_predictions/<user_id>', methods=['GET'])
def get_predictions(user_id):
    predictions = list(predictions_collection.find({"user_id": user_id}, {"_id": 0}))
    return jsonify(predictions)

# === Store Chat History ===
@app.route('/store_chat', methods=['POST'])
def store_chat():
    chat_data = request.json
    chat_collection.insert_one(chat_data)
    return jsonify({"message": "Chat stored successfully"})

# === Check Memory Usage ===
@app.route('/memory', methods=['GET'])
def memory_check():
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    return jsonify({
        'rss_MB': round(mem_info.rss / 1024 ** 2, 2),
        'vms_MB': round(mem_info.vms / 1024 ** 2, 2)
    })

# === Run Server ===
if __name__ == '__main__':
    app.run(port=5001, debug=False)
