from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LoanEligibilityRequest, LoanEligibilityResponse
from app.ml.predict import calculate_monthly_emi, predict_loan_default

router = APIRouter(prefix="/api/eligibility", tags=["Loan Eligibility"])

# Configurable Banking Policy Rules
POLICY_RULES = {
    "Home Loan": {
        "min_credit_score": 650,
        "max_dti": 0.50,
        "max_income_multiplier": 5.0,
        "base_interest_rate": 0.068
    },
    "Personal Loan": {
        "min_credit_score": 620,
        "max_dti": 0.40,
        "max_income_multiplier": 0.6,
        "base_interest_rate": 0.115
    },
    "Vehicle Loan": {
        "min_credit_score": 630,
        "max_dti": 0.45,
        "max_income_multiplier": 0.8,
        "base_interest_rate": 0.082
    },
    "Education Loan": {
        "min_credit_score": 600,
        "max_dti": 0.48,
        "max_income_multiplier": 1.2,
        "base_interest_rate": 0.055
    }
}

@router.post("/check", response_model=LoanEligibilityResponse)
def evaluate_loan_eligibility(payload: LoanEligibilityRequest, db: Session = Depends(get_db)):
    policy = POLICY_RULES.get(payload.loan_type, POLICY_RULES["Personal Loan"])
    monthly_income = payload.annual_income / 12.0
    
    # Calculate EMI for requested loan
    interest_rate = policy["base_interest_rate"]
    if payload.credit_score < policy["min_credit_score"]:
        interest_rate += 0.02
    
    monthly_emi = calculate_monthly_emi(payload.requested_loan_amount, interest_rate, payload.loan_tenure)
    
    # Calculate total monthly obligations and DTI
    total_monthly_obligations = payload.monthly_expenses * 0.35 + payload.existing_liabilities + monthly_emi
    calculated_dti = round((total_monthly_obligations / max(1.0, monthly_income)), 3)

    # Perform Policy Checks
    score_pass = payload.credit_score >= policy["min_credit_score"]
    dti_pass = calculated_dti <= policy["max_dti"]
    income_mult_pass = payload.requested_loan_amount <= (payload.annual_income * policy["max_income_multiplier"])
    repay_pass = payload.repayment_history <= 1
    
    policy_checks = {
        f"Credit Score >= {policy['min_credit_score']}": score_pass,
        f"Debt-to-Income <= {int(policy['max_dti'] * 100)}%": dti_pass,
        f"Loan Amount <= {policy['max_income_multiplier']}x Annual Income": income_mult_pass,
        "Repayment History (<= 1 missed)": repay_pass
    }

    # Query ML model for risk scoring
    ml_input = {
        "customer_age": 36,
        "annual_income": payload.annual_income,
        "employment_status": "Employed" if payload.employment_type in ["Salaried", "Corporate", "Public Sector"] else "Self-Employed",
        "credit_score": payload.credit_score,
        "existing_loan_amount": payload.existing_liabilities * 12.0,
        "loan_amount_requested": payload.requested_loan_amount,
        "loan_tenure": payload.loan_tenure,
        "monthly_expenses": payload.monthly_expenses,
        "debt_to_income_ratio": calculated_dti,
        "previous_repayment_history": payload.repayment_history,
        "number_of_existing_loans": 1 if payload.existing_liabilities > 0 else 0
    }
    ml_res = predict_loan_default(ml_input)
    default_prob = ml_res["default_probability"]
    risk_category = ml_res["risk_category"]

    reasons = []
    failed_checks = [k for k, v in policy_checks.items() if not v]

    # Synthesize Recommendation
    if all(policy_checks.values()) and risk_category == "Low Risk":
        eligibility_status = "Recommended for Approval"
        reasons.append("Applicant satisfies all policy guidelines including prime credit score and healthy DTI cushion.")
        reasons.append(f"ML Risk classification is Low Risk with a low {default_prob}% projected default probability.")
    elif len(failed_checks) >= 2 or risk_category == "High Risk" or calculated_dti > (policy["max_dti"] + 0.10):
        eligibility_status = "Not Recommended"
        for check in failed_checks:
            reasons.append(f"Breached guideline: {check}.")
        if risk_category == "High Risk":
            reasons.append(f"ML model categorized applicant as High Risk with {default_prob}% default probability.")
    else:
        eligibility_status = "Requires Manual Review"
        reasons.append("Applicant presents a borderline underwriting profile suitable for secondary credit committee review.")
        for check in failed_checks:
            reasons.append(f"Non-compliant guideline: {check}.")
        if risk_category != "Low Risk":
            reasons.append(f"Model risk rating is {risk_category} ({default_prob}% default probability).")

    # Max Affordable Loan calculation
    max_allowable_debt_pmt = (monthly_income * policy["max_dti"]) - (payload.monthly_expenses * 0.35 + payload.existing_liabilities)
    max_allowable_debt_pmt = max(0.0, max_allowable_debt_pmt)
    
    r = interest_rate / 12.0
    n = payload.loan_tenure
    if r > 0 and n > 0:
        suggested_max = round(max_allowable_debt_pmt * ((1 - (1 + r) ** (-n)) / r), 2)
    else:
        suggested_max = round(max_allowable_debt_pmt * n, 2)
    suggested_max = max(1000.0, min(suggested_max, payload.annual_income * policy["max_income_multiplier"]))

    return {
        "loan_type": payload.loan_type,
        "requested_amount": payload.requested_loan_amount,
        "estimated_monthly_emi": monthly_emi,
        "debt_to_income_ratio": round(calculated_dti * 100, 2),
        "max_dti_allowed": round(policy["max_dti"] * 100, 2),
        "loan_eligibility_status": eligibility_status,
        "risk_category": risk_category,
        "default_probability": default_prob,
        "reasons": reasons,
        "suggested_max_loan_amount": suggested_max,
        "policy_checks": policy_checks,
        "disclaimer": "This is an automated decision-support recommendation prototype for analytical purposes. Final loan sanctioning requires official human underwriter sign-off and regulatory validation."
    }
