import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# === Load the updated dataset ===
DATA_FILE = 'mental_health_questionnaire.csv'  # Update this if needed

if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"❌ Dataset not found: {DATA_FILE}")

data = pd.read_csv(DATA_FILE)

# === Keep only the 10 actual input features for training ===
training_features = [
    'mood', 'sleep', 'energy', 'appetite', 'interest',
    'irritability', 'concentration', 'feelingWorthy',
    'anxiousThoughts', 'panicAttacks'
]

if 'depression' not in data.columns:
    raise ValueError("❌ 'depression' column (label) not found in dataset.")

missing_features = [col for col in training_features if col not in data.columns]
if missing_features:
    raise ValueError(f"❌ Missing features in dataset: {missing_features}")

# Filter only required columns
X = data[training_features]
y = data['depression']

# === Encode categorical columns ===
label_encoders = {}
for column in X.columns:
    if X[column].dtype == 'object':
        le = LabelEncoder()
        X[column] = le.fit_transform(X[column])
        label_encoders[column] = le

# Encode target variable
if y.dtype == 'object':
    le_target = LabelEncoder()
    y = le_target.fit_transform(y)
    label_encoders['depression'] = le_target

# === Train/Test Split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Train the model ===
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# === Predict & Evaluate ===
y_pred = model.predict(X_test)
print("\n✅ Classification Report:")
print(classification_report(y_test, y_pred))
print("✅ Accuracy Score:", accuracy_score(y_test, y_pred))

# === Save the model ===
joblib.dump(model, 'model.pkl')
print("\n✅ Trained model saved as 'model.pkl'")

# === Save label encoders ===
encoder_dir = 'label_encoders'
os.makedirs(encoder_dir, exist_ok=True)

for column, encoder in label_encoders.items():
    joblib.dump(encoder, os.path.join(encoder_dir, f'{column}_label_encoder.joblib'))

print(f"✅ Saved label encoders in '{encoder_dir}/' directory")
