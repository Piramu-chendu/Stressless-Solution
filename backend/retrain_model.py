import pandas as pd
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# === Constants ===
DATA_FILE = 'mental_health_questionnaire.csv'
MODEL_FILE = 'model.pkl'
ENCODER_DIR = 'label_encoders'

# === Check dataset existence ===
if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"❌ Dataset not found: {DATA_FILE}")

# === Load Dataset ===
data = pd.read_csv(DATA_FILE)

# === Feature and Target Selection ===
features = [
    'mood', 'sleep', 'energy', 'appetite', 'interest',
    'irritability', 'concentration', 'feelingWorthy',
    'anxiousThoughts', 'panicAttacks'
]
target = 'depression'

# === Check columns ===
missing_features = [col for col in features if col not in data.columns]
if missing_features:
    raise ValueError(f"❌ Missing features in dataset: {missing_features}")

if target not in data.columns:
    raise ValueError(f"❌ Target column '{target}' not found in dataset.")

X = data[features].copy()
y = data[target].copy()

# === Encode categorical variables ===
label_encoders = {}

def encode_column(column_data, column_name):
    le = LabelEncoder()
    encoded = le.fit_transform(column_data)
    label_encoders[column_name] = le
    return encoded

# Encode features
for col in X.columns:
    if X[col].dtype == 'object':
        X[col] = encode_column(X[col], col)

# Encode target
if y.dtype == 'object':
    y = encode_column(y, target)

# === Train/Test Split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Model Training ===
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# === Model Evaluation ===
y_pred = model.predict(X_test)
print("\n✅ Classification Report:")
print(classification_report(y_test, y_pred))
print(f"✅ Accuracy Score: {accuracy_score(y_test, y_pred):.4f}")

# === Save model ===
joblib.dump(model, MODEL_FILE)
print(f"\n✅ Trained model saved as '{MODEL_FILE}'")

# === Save label encoders ===
os.makedirs(ENCODER_DIR, exist_ok=True)

for col, le in label_encoders.items():
    joblib.dump(le, os.path.join(ENCODER_DIR, f'{col}_label_encoder.joblib'))

print(f"✅ All label encoders saved inside '{ENCODER_DIR}/'")
