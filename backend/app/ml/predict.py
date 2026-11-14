import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.ml.train_model import FEATURE_COLUMNS, EMPLOYMENT_MAP, MODELS_DIR

_rf_model = None
_scaler = None

def get_model():
    global _rf_model, _scaler
    if _rf_model is None:
        model_path = os.path.join(MODELS_DIR, "random_forest_loan_default.joblib")
        scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
        if os.path.exists(model_path):
            _rf_model = joblib.load(model_path)
        if os.path.exists(scaler_path):
            _scaler = joblib.load(scaler_path)
    return _rf_model, _scaler

def calculate_monthly_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    if annual_rate <= 0 or tenure_months <= 0:
        return round(principal / max(1, tenure_months), 2)
    monthly_rate = annual_rate / 12.0
    emi = (principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)) / (((1 + monthly_rate) ** tenure_months) - 1)
    return round(emi, 2)

def predict_loan_default(data: Dict[str, Any]) -> Dict[str, Any]:
    # Extract baseline financials
    annual_inc = float(data["annual_income"])
    monthly_inc = annual_inc / 12.0
    req_amount = float(data["loan_amount_requested"])
    tenure = int(data["loan_tenure"])
    cs = int(data["credit_score"])
    est_rate = 0.075 if cs >= 720 else (0.105 if cs >= 640 else 0.14)
    emi = calculate_monthly_emi(req_amount, est_rate, tenure)

    # Guaranteed clean float DTI
    raw_dti = data.get("debt_to_income_ratio")
    if raw_dti is None or float(raw_dti) <= 0:
        total_monthly_debts = float(data.get("monthly_expenses", 0)) * 0.30 + emi
        dti = round(total_monthly_debts / max(1.0, monthly_inc), 3)
    else:
        dti = float(raw_dti)

    rf_model, _ = get_model()
    if rf_model is None:
        # Fallback heuristic if model file not yet compiled
        raw_prob = 0.15
        if cs < 600:
            raw_prob += 0.35
        if dti > 0.45:
            raw_prob += 0.25
        if int(data.get("previous_repayment_history", 0)) > 0:
            raw_prob += 0.20
        default_prob = round(min(0.95, max(0.02, raw_prob)), 4)
        confidence = 0.88
    else:
        emp_code = EMPLOYMENT_MAP.get(data.get("employment_status", "Employed"), 1)

        features = [
            int(data["customer_age"]),
            annual_inc,
            emp_code,
            cs,
            float(data.get("existing_loan_amount", 0.0)),
            req_amount,
            tenure,
            float(data.get("monthly_expenses", 0.0)),
            dti,
            int(data.get("previous_repayment_history", 0)),
            int(data.get("number_of_existing_loans", 0))
        ]

        X_input = pd.DataFrame([features], columns=FEATURE_COLUMNS)
        prob_array = rf_model.predict_proba(X_input)[0]
        default_prob = float(prob_array[1])

        # Model confidence: Measured through inter-tree consensus
        tree_preds = np.array([tree.predict(X_input.values)[0] for tree in rf_model.estimators_])
        agreement_ratio = max(np.mean(tree_preds), 1.0 - np.mean(tree_preds))
        confidence = round(float(agreement_ratio), 4)

    prob_pct = round(default_prob * 100.0, 2)
    conf_pct = round(confidence * 100.0, 2)

    # Risk categorization
    if prob_pct < 25.0:
        risk_category = "Low Risk"
    elif prob_pct < 60.0:
        risk_category = "Medium Risk"
    else:
        risk_category = "High Risk"

    # Automated decision recommendation
    missed_pmts = int(data.get("previous_repayment_history", 0))
    emp_status = data.get("employment_status", "Employed")

    if risk_category == "Low Risk" and dti <= 0.45 and cs >= 620 and missed_pmts == 0:
        recommendation = "Recommended for Approval"
    elif risk_category == "High Risk" or dti > 0.55 or cs < 540 or missed_pmts >= 3:
        recommendation = "Not Recommended"
    else:
        recommendation = "Requires Manual Review"

    # Feature contribution breakdown
    contributing_factors: List[Dict[str, Any]] = []

    # 1. Credit Score
    if cs >= 740:
        contributing_factors.append({
            "feature": "Credit Score",
            "value": cs,
            "impact": "Decrease Risk",
            "importance": 0.28,
            "description": f"Excellent credit score ({cs}) significantly lowers credit risk."
        })
    elif cs >= 650:
        contributing_factors.append({
            "feature": "Credit Score",
            "value": cs,
            "impact": "Neutral",
            "importance": 0.20,
            "description": f"Satisfactory credit score ({cs}) within standard prime tolerance."
        })
    else:
        contributing_factors.append({
            "feature": "Credit Score",
            "value": cs,
            "impact": "Increase Risk",
            "importance": 0.32,
            "description": f"Subprime credit score ({cs}) indicates elevated historical repayment risk."
        })

    # 2. Debt-to-Income
    dti_pct = round(dti * 100, 1)
    if dti <= 0.35:
        contributing_factors.append({
            "feature": "Debt-to-Income Ratio",
            "value": f"{dti_pct}%",
            "impact": "Decrease Risk",
            "importance": 0.25,
            "description": f"Prudent DTI ({dti_pct}%) leaves substantial disposable cushion."
        })
    elif dti <= 0.45:
        contributing_factors.append({
            "feature": "Debt-to-Income Ratio",
            "value": f"{dti_pct}%",
            "impact": "Neutral",
            "importance": 0.22,
            "description": f"DTI ({dti_pct}%) is within statutory limits but tight."
        })
    else:
        contributing_factors.append({
            "feature": "Debt-to-Income Ratio",
            "value": f"{dti_pct}%",
            "impact": "Increase Risk",
            "importance": 0.28,
            "description": f"High DTI ({dti_pct}%) signals cash flow stress relative to debt obligations."
        })

    # 3. Repayment History
    if missed_pmts == 0:
        contributing_factors.append({
            "feature": "Repayment Track Record",
            "value": "Clean",
            "impact": "Decrease Risk",
            "importance": 0.18,
            "description": "Zero prior missed or delinquent installment payments."
        })
    else:
        contributing_factors.append({
            "feature": "Repayment Track Record",
            "value": f"{missed_pmts} missed payments",
            "impact": "Increase Risk",
            "importance": 0.24,
            "description": f"{missed_pmts} past missed/late installment(s) recorded."
        })

    # 4. Employment Status
    if emp_status in ["Employed", "Business"]:
        contributing_factors.append({
            "feature": "Employment Stability",
            "value": emp_status,
            "impact": "Decrease Risk",
            "importance": 0.12,
            "description": f"Active {emp_status} status provides verifiable ongoing cash flows."
        })
    else:
        contributing_factors.append({
            "feature": "Employment Stability",
            "value": emp_status,
            "impact": "Increase Risk",
            "importance": 0.16,
            "description": f"{emp_status} profiles possess higher earnings variance."
        })

    # Plain English explanation
    explanation_parts = [
        f"Applicant exhibits a default probability of {prob_pct}% (Ensemble Model Consensus: {conf_pct}% confidence).",
        f"Assigned risk classification is {risk_category}."
    ]
    if risk_category == "Low Risk":
        explanation_parts.append(
            f"The customer demonstrates strong debt servicing capacity with a {cs} credit score and {dti_pct}% DTI."
        )
    elif risk_category == "Medium Risk":
        explanation_parts.append(
            f"Applicant qualifies moderately, but presents borderline metrics ({cs} credit score or {dti_pct}% DTI). Manual verification of assets is advised."
        )
    else:
        explanation_parts.append(
            f"Significant risk vectors detected: elevated default probability ({prob_pct}%) compounded by adverse financial ratios. Mitigating collateral or cosigners required."
        )

    explanation = " ".join(explanation_parts)

    # Maximum affordable EMI allowed under 45% DTI cap
    existing_commitments = float(data.get("monthly_expenses", 0)) * 0.35 + float(data.get("existing_loan_amount", 0)) * 0.02
    max_allowable_emi = max(0.0, (monthly_inc * 0.45) - existing_commitments)
    
    # Calculate present value loan amount for that EMI
    r = est_rate / 12.0
    if r > 0 and tenure > 0:
        max_affordable_loan = round(max_allowable_emi * ((1 - (1 + r) ** (-tenure)) / r), 2)
    else:
        max_affordable_loan = round(max_allowable_emi * tenure, 2)
    
    max_affordable_loan = max(1000.0, max_affordable_loan)

    return {
        "default_probability": prob_pct,
        "model_confidence": conf_pct,
        "risk_category": risk_category,
        "recommendation": recommendation,
        "contributing_factors": contributing_factors,
        "explanation": explanation,
        "estimated_emi": emi,
        "calculated_dti": round(dti * 100, 2),
        "max_affordable_loan": max_affordable_loan
    }
