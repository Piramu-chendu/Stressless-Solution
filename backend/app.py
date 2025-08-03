from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from pymongo import MongoClient
import os
import psutil
import traceback
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from flask_cors import CORS

# === Flask App Initialization ===
app = Flask(__name__)
CORS(app)

# === MongoDB Connection ===
MONGO_URI = "mongodb+srv://chendusoundharya:q0mtL8iYFlw10rvI@mental-health-cluster.ixrz2.mongodb.net/?retryWrites=true&w=majority&appName=mental-health-cluster"
client = MongoClient(MONGO_URI)
db = client["mental_health_db"]

# === Collections ===
users_collection = db["users"]
responses_collection = db["questionnaire_responses"]
predictions_collection = db["predictions"]
chat_collection = db["chat_history"]
journal_collection = db["journal_predictions"]

# === Model and Encoder Loading ===
MODEL_FILE = 'model.pkl'
ENCODER_DIR = 'label_encoders'
DATA_FILE = 'mental_health_questionnaire.csv'

# === Required Fields ===
required_fields = [
    'mood', 'sleep', 'energy', 'appetite', 'interest',
    'irritability', 'concentration', 'feelingWorthy',
    'anxiousThoughts', 'panicAttacks',
    'stress', 'anxiety'
]

model = None
label_encoders = {}

def load_model_and_encoders():
    global model, label_encoders
    try:
        model = joblib.load(MODEL_FILE)
        print("✅ Model loaded successfully.")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        model = None

    label_encoders = {}
    try:
        if os.path.exists(ENCODER_DIR):
            for field in required_fields:
                filepath = os.path.join(ENCODER_DIR, f"{field}_label_encoder.joblib")
                if os.path.exists(filepath):
                    label_encoders[field] = joblib.load(filepath)
            print("✅ Label encoders loaded successfully.")
        else:
            print(f"⚠️ Warning: '{ENCODER_DIR}/' directory not found.")
    except Exception as e:
        print(f"❌ Failed to load label encoders: {e}")

load_model_and_encoders()

# === Depression Solution Helper ===
def get_depression_solution(depression_level):
    solutions = {
        0: "Seek professional help if needed. Engage in activities that uplift your mood.",
        1: "Practice relaxation techniques and focus on building a healthy routine.",
        2: "Try socializing with friends or participating in activities you enjoy.",
        3: "Consider seeking support from a mental health professional."
    }
    return solutions.get(depression_level, "No solution available for this level.")

# === API: Submit Questionnaire ===
@app.route('/submit', methods=['POST'])
def submit():
    if model is None:
        return jsonify({'error': 'Model not loaded.'}), 500

    try:
        data = request.get_json()
        print(f"📥 Received data: {data}")

        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields in request.'}), 400

        input_vector = []
        for field in required_fields:
            value = data[field]
            if field in label_encoders:
                try:
                    encoded_value = label_encoders[field].transform([value])[0]
                except ValueError:
                    encoded_value = 0
            else:
                fallback_map = {
                    "Low": 1, "Moderate": 2, "High": 3,
                    "Neutral": 2, "Somewhat": 2, "Normal": 2,
                    "Somewhat Irritable": 2, "Sometimes": 2, "No": 0
                }
                encoded_value = fallback_map.get(value, 0)
            input_vector.append(encoded_value)

        df = pd.DataFrame([input_vector], columns=required_fields)
        prediction = model.predict(df)

        depression_level = prediction[0]
        depression_solution = get_depression_solution(depression_level)

        responses_collection.insert_one(data)
        predictions_collection.insert_one({
            "user_id": data.get("user_id", "unknown"),
            "features": data,
            "prediction": prediction.tolist()
        })

        return jsonify({
            'prediction': prediction.tolist(),
            'depressionSolution': depression_solution
        })

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# === API: Analyze Journal Entry and Store ===
@app.route('/journal-analyze', methods=['POST'])
def analyze_journal():
    try:
        data = request.get_json()
        journal_content = data.get('journalContent', '')

        if not journal_content:
            return jsonify({'error': 'Journal content is required'}), 400

        mood = 'Neutral'
        lc = journal_content.lower()
        if any(word in lc for word in ['happy', 'joy', 'excited']):
            mood = 'Happy'
        elif any(word in lc for word in ['sad', 'depressed', 'down']):
            mood = 'Sad'
        elif any(word in lc for word in ['anxious', 'worried', 'stressed']):
            mood = 'Anxious'

        stress_words = ['stress', 'tired', 'exhausted', 'overwhelmed']
        anxiety_words = ['anxious', 'worried', 'nervous', 'uneasy']
        depression_words = ['sad', 'hopeless', 'empty', 'down']

        stress_level = 'High' if any(w in lc for w in stress_words) else 'Low'
        anxiety_level = 'High' if any(w in lc for w in anxiety_words) else 'Low'
        depression_level = 'High' if any(w in lc for w in depression_words) else 'Low'

        stress_solution = 'Take deep breaths and practice mindfulness' if stress_level == 'High' else 'Stay calm and relaxed!'
        anxiety_solution = 'Talk to someone you trust' if anxiety_level == 'High' else 'Relax and enjoy your moment'
        depression_solution = 'Engage in activities you enjoy' if depression_level == 'High' else 'Keep your spirits up!'

        journal_doc = {
            'content': journal_content,
            'moodPrediction': mood,
            'stressLevel': stress_level,
            'anxietyLevel': anxiety_level,
            'depressionLevel': depression_level,
            'stressSolution': stress_solution,
            'anxietySolution': anxiety_solution,
            'depressionSolution': depression_solution,
            'createdAt': pd.Timestamp.now()
        }

        journal_collection.insert_one(journal_doc)

        return jsonify(journal_doc), 200

    except Exception as e:
        print(f"❌ Error analyzing journal entry: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# === API: Keyword-Only Prediction (No DB Save) ===
@app.route('/predict_journal', methods=['POST'])
def predict_journal():
    try:
        data = request.get_json()
        content = data.get('content', '').lower()
        print('📩 Received content for prediction:', content)

        depression = 'High' if any(word in content for word in ['worthless', 'hopeless', 'empty', 'numb']) else 'Low'
        stress = 'High' if any(word in content for word in ['deadline', 'pressure', 'overwhelmed', 'tired']) else 'Low'
        anxiety = 'High' if any(word in content for word in ['panic', 'worry', 'nervous', 'scared']) else 'Low'

        return jsonify({
            'stress': stress,
            'anxiety': anxiety,
            'depression': depression
        })
    except Exception as e:
        print(f"❌ Error in /predict_journal: {e}")
        return jsonify({'error': str(e)}), 500

# === API: Retrain Model ===
@app.route('/retrain', methods=['POST'])
def retrain_model():
    try:
        if not os.path.exists(DATA_FILE):
            return jsonify({'error': f"Dataset file '{DATA_FILE}' not found."}), 404

        data = pd.read_csv(DATA_FILE)
        training_features = required_fields

        if 'depression' not in data.columns:
            return jsonify({'error': "'depression' column not found in dataset."}), 400

        X = data[training_features]
        y = data['depression']

        label_encoders_local = {}
        for column in X.columns:
            if X[column].dtype == 'object':
                le = LabelEncoder()
                X[column] = le.fit_transform(X[column])
                label_encoders_local[column] = le

        if y.dtype == 'object':
            le_target = LabelEncoder()
            y = le_target.fit_transform(y)
            label_encoders_local['depression'] = le_target

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        new_model = RandomForestClassifier(n_estimators=100, random_state=42)
        new_model.fit(X_train, y_train)

        joblib.dump(new_model, MODEL_FILE)

        os.makedirs(ENCODER_DIR, exist_ok=True)
        for column, encoder in label_encoders_local.items():
            joblib.dump(encoder, os.path.join(ENCODER_DIR, f'{column}_label_encoder.joblib'))

        load_model_and_encoders()

        print("✅ Model retrained and reloaded successfully.")
        return jsonify({'message': 'Model retrained successfully!'}), 200

    except Exception as e:
        print(f"❌ Error retraining model: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# === Main Runner ===
if __name__ == '__main__':
    app.run(port=5001, debug=False)
