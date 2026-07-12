"""
train_model.py — ML Training Script for PayGuard-Neural

WHAT: Generates a synthetic PaySim-style dataset and trains a Random
Forest Classifier. Saves trained model as models/model.pkl.

WHY: Real UPI data is confidential. Synthetic data mimics realistic
fraud distributions observed at Nagpur Cyber Police Station.

FEATURES (4):
  [0] account_age_days     — newer = riskier
  [1] txn_velocity_per_day — high velocity = riskier
  [2] report_frequency     — more reports = riskier
  [3] amount_deviation     — higher deviation = riskier

USAGE: python train_model.py → Creates app/models/model.pkl
"""

import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

np.random.seed(42)


def generate_synthetic_dataset(n_samples=2000):
    """
    Generates synthetic dataset: 70% safe (label=1), 30% fraud (label=0).
    """
    n_safe = int(n_samples * 0.7)
    n_fraud = n_samples - n_safe

    # Safe transactions (label=1)
    safe_age = np.random.uniform(180, 730, n_safe)
    safe_velocity = np.random.uniform(0.5, 4.0, n_safe)
    safe_reports = np.random.uniform(0, 0.5, n_safe)
    safe_deviation = np.random.uniform(0, 0.8, n_safe)
    X_safe = np.column_stack([safe_age, safe_velocity, safe_reports, safe_deviation])
    y_safe = np.ones(n_safe, dtype=int)

    # Fraudulent transactions (label=0)
    fraud_age = np.random.uniform(1, 60, n_fraud)
    fraud_velocity = np.random.uniform(6, 15, n_fraud)
    fraud_reports = np.random.uniform(2, 5, n_fraud)
    fraud_deviation = np.random.uniform(1.5, 3, n_fraud)
    X_fraud = np.column_stack([fraud_age, fraud_velocity, fraud_reports, fraud_deviation])
    y_fraud = np.zeros(n_fraud, dtype=int)

    X = np.vstack([X_safe, X_fraud])
    y = np.concatenate([y_safe, y_fraud])
    indices = np.random.permutation(len(y))
    return X[indices], y[indices]


def train_and_save_model():
    """Main training pipeline."""
    print("=" * 60)
    print("  PayGuard-Neural — ML Model Training")
    print("=" * 60)

    print("\n[1/5] Generating synthetic PaySim-style dataset...")
    X, y = generate_synthetic_dataset(n_samples=2000)
    print(f"      Dataset: {len(X)} samples, {X.shape[1]} features")
    print(f"      Safe: {sum(y == 1)}, Fraud: {sum(y == 0)}")

    print("\n[2/5] Splitting into train (80%) / test (20%)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"      Train: {len(X_train)}, Test: {len(X_test)}")

    print("\n[3/5] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100, max_depth=10,
        min_samples_split=5, min_samples_leaf=2,
        random_state=42, n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print("      OK Model trained successfully")

    print("\n[4/5] Evaluating on test set...")
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"      Train accuracy: {train_acc:.4f}")
    print(f"      Test accuracy:  {test_acc:.4f}")

    # Verify the 3 demo UPI IDs
    print("\n      Verifying demo UPI ID predictions:")
    demo_cases = {
        "lucky99@upi (should be HIGH_RISK, score < 40)": [8, 14.2, 4.8, 2.9],
        "newdeal@paytm (should be CAUTION, score 40-79)": [120, 5.5, 1.5, 1.2],
        "vaishnavi@okaxis (should be SAFE, score 80-100)": [650, 1.2, 0.0, 0.1],
    }
    for name, features in demo_cases.items():
        proba = model.predict_proba([features])[0]
        score = round(proba[1] * 100, 1)
        if score >= 80:
            label = "[SAFE]"
        elif score >= 40:
            label = "[CAUTION]"
        else:
            label = "[HIGH_RISK]"
        print(f"      {name}")
        print(f"        -> Score: {score}/100  {label}")

    print("\n[5/5] Saving model...")
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "model.pkl")
    joblib.dump(model, model_path)
    print(f"      OK Saved to {model_path}")

    print("\n" + "=" * 60)
    print("  Training complete! You can now start the Flask server.")
    print("=" * 60)


if __name__ == "__main__":
    train_and_save_model()
