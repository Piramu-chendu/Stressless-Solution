import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib  # Import joblib to save the model

# Load the dataset
data = pd.read_csv('mental_health_questionnaire.csv')  # Ensure this path is correct

# Print the first few rows of the dataset
print("Dataset Preview:")
print(data.head())

# Encode categorical variables
label_encoders = {}
for column in data.columns:
    if data[column].dtype == 'object':
        le = LabelEncoder()
        data[column] = le.fit_transform(data[column])
        label_encoders[column] = le

# Define features and target variable
X = data.drop('depression', axis=1)  # Features
y = data['depression']  # Target variable

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the Random Forest Classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)

# Train the model
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
print("Classification Report:")
print(classification_report(y_test, y_pred))

print("Accuracy Score:", accuracy_score(y_test, y_pred))

# Save the trained model to a file
joblib.dump(model, 'model.pkl')  # Save the model as 'model.pkl' in the current directory

# Optional: Save label encoders if needed for future use
for column, encoder in label_encoders.items():
    joblib.dump(encoder, f'{column}_label_encoder.joblib')
