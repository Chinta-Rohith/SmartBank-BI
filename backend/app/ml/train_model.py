import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
)
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Customer, Loan

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "trained_models")
os.makedirs(MODELS_DIR, exist_ok=True)

# Feature definitions for Loan Default
FEATURE_COLUMNS = [
    "customer_age",
    "annual_income",
    "employment_status_encoded",
    "credit_score",
    "existing_loan_amount",
    "loan_amount_requested",
    "loan_tenure",
    "monthly_expenses",
    "debt_to_income_ratio",
    "previous_repayment_history",
    "number_of_existing_loans"
]

EMPLOYMENT_MAP = {
    "Employed": 1,
    "Self-Employed": 2,
    "Business": 3,
    "Unemployed": 0
}

def extract_training_dataset(db: Session) -> pd.DataFrame:
    query = db.query(Customer, Loan).join(Loan, Customer.id == Loan.customer_id).all()
    rows = []
    for cust, ln in query:
        emp_code = EMPLOYMENT_MAP.get(cust.employment_status, 1)
        rows.append({
            "customer_age": cust.age,
            "annual_income": cust.annual_income,
            "employment_status_encoded": emp_code,
            "credit_score": cust.credit_score,
            "existing_loan_amount": round(ln.outstanding_balance * 0.4, 2),
            "loan_amount_requested": ln.loan_amount,
            "loan_tenure": ln.tenure_months,
            "monthly_expenses": cust.monthly_expenses,
            "debt_to_income_ratio": ln.debt_to_income_ratio,
            "previous_repayment_history": ln.previous_missed_payments,
            "number_of_existing_loans": 1 if ln.outstanding_balance > 0 else 0,
            "default_flag": ln.default_flag
        })
    return pd.DataFrame(rows)

def train_default_models():
    print("[*] Initiating Loan Default Model Training Pipeline...")
    db = SessionLocal()
    try:
        df = extract_training_dataset(db)
        if len(df) < 200:
            print("[!] Insufficient database records found to train model. Ensure data generation ran first.")
            return None
        
        print(f"[+] Loaded {len(df)} records from database for model training.")
        
        X = df[FEATURE_COLUMNS]
        y = df["default_flag"]

        # Stratified train-test split (80% train, 20% test)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        # 1. Random Forest Classifier
        rf_model = RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=1
        )
        rf_model.fit(X_train, y_train)

        # 2. Logistic Regression (Baseline Model)
        lr_model = LogisticRegression(
            class_weight="balanced",
            max_iter=1000,
            random_state=42
        )
        lr_model.fit(X_train_scaled, y_train)

        # Evaluations
        # Random Forest evaluation
        y_pred_rf = rf_model.predict(X_test)
        y_prob_rf = rf_model.predict_proba(X_test)[:, 1]
        cm_rf = confusion_matrix(y_test, y_pred_rf).tolist()

        rf_metrics = {
            "model_name": "Random Forest Classifier",
            "accuracy": round(float(accuracy_score(y_test, y_pred_rf)), 4),
            "precision": round(float(precision_score(y_test, y_pred_rf, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred_rf, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred_rf, zero_division=0)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, y_prob_rf)), 4),
            "confusion_matrix": {
                "true_negative": cm_rf[0][0],
                "false_positive": cm_rf[0][1],
                "false_negative": cm_rf[1][0],
                "true_positive": cm_rf[1][1]
            }
        }

        # Baseline Logistic Regression evaluation
        y_pred_lr = lr_model.predict(X_test_scaled)
        y_prob_lr = lr_model.predict_proba(X_test_scaled)[:, 1]
        cm_lr = confusion_matrix(y_test, y_pred_lr).tolist()

        lr_metrics = {
            "model_name": "Logistic Regression (Baseline)",
            "accuracy": round(float(accuracy_score(y_test, y_pred_lr)), 4),
            "precision": round(float(precision_score(y_test, y_pred_lr, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred_lr, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred_lr, zero_division=0)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, y_prob_lr)), 4),
            "confusion_matrix": {
                "true_negative": cm_lr[0][0],
                "false_positive": cm_lr[0][1],
                "false_negative": cm_lr[1][0],
                "true_positive": cm_lr[1][1]
            }
        }

        # Feature Importances
        importances = rf_model.feature_importances_
        feature_importance_list = [
            {"feature": col, "importance": round(float(imp), 4)}
            for col, imp in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True)
        ]

        metrics_payload = {
            "trained_at": pd.Timestamp.now().isoformat(),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "random_forest": rf_metrics,
            "logistic_regression": lr_metrics,
            "feature_importances": feature_importance_list
        }

        # Save artifacts
        joblib.dump(rf_model, os.path.join(MODELS_DIR, "random_forest_loan_default.joblib"))
        joblib.dump(lr_model, os.path.join(MODELS_DIR, "logistic_regression_loan_default.joblib"))
        joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.joblib"))

        with open(os.path.join(MODELS_DIR, "ml_metrics.json"), "w") as f:
            json.dump(metrics_payload, f, indent=2)

        print("[+] Random Forest & Baseline models trained and serialized successfully!")
        print(f"    RF Accuracy: {rf_metrics['accuracy']} | F1: {rf_metrics['f1_score']} | ROC-AUC: {rf_metrics['roc_auc']}")
        print(f"    LR Accuracy: {lr_metrics['accuracy']} | F1: {lr_metrics['f1_score']} | ROC-AUC: {lr_metrics['roc_auc']}")
        return metrics_payload

    finally:
        db.close()

if __name__ == "__main__":
    train_default_models()
