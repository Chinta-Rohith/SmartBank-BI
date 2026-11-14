from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: str
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: str = "Loan Officer"

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Branch & Product Schemas ---
class BranchOut(BaseModel):
    id: int
    branch_code: str
    branch_name: str
    city: str
    state: str
    manager_name: Optional[str]

    class Config:
        from_attributes = True

class BankingProductOut(BaseModel):
    id: int
    product_code: str
    name: str
    category: str
    interest_rate: float
    min_credit_score: int
    base_fee: float
    operational_cost_rate: float
    is_active: bool

    class Config:
        from_attributes = True


# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    age: int
    gender: Optional[str] = None
    annual_income: float
    monthly_expenses: float
    credit_score: int
    employment_status: str
    employment_type: Optional[str] = None
    account_balance: float = 0.0
    total_banking_products: int = 1
    avg_monthly_spending: float = 0.0
    segment: Optional[str] = "Regular Customers"
    risk_rating: Optional[str] = "Low"
    branch_id: Optional[int] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: int
    customer_id: str
    created_at: datetime
    branch: Optional[BranchOut] = None

    class Config:
        from_attributes = True

class CustomerPagination(BaseModel):
    items: List[CustomerOut]
    total: int
    page: int
    page_size: int
    total_pages: int


# --- Loan Schemas ---
class LoanBase(BaseModel):
    customer_id: int
    branch_id: Optional[int] = None
    loan_type: str
    loan_amount: float
    tenure_months: int
    interest_rate: float
    monthly_emi: float
    outstanding_balance: float
    status: str = "Approved"
    default_flag: int = 0
    debt_to_income_ratio: float = 0.0

class LoanCreate(LoanBase):
    pass

class LoanOut(LoanBase):
    id: int
    loan_id: str
    approval_date: datetime
    created_at: datetime
    customer: Optional[CustomerOut] = None
    branch: Optional[BranchOut] = None

    class Config:
        from_attributes = True

class LoanPagination(BaseModel):
    items: List[LoanOut]
    total: int
    page: int
    page_size: int
    total_pages: int


# --- Complaint Schemas ---
class ComplaintCreate(BaseModel):
    customer_id: int
    category: str
    priority: str = "Medium"
    description: str

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None
    satisfaction_score: Optional[int] = None

class ComplaintOut(BaseModel):
    id: int
    complaint_id: str
    customer_id: int
    category: str
    priority: str
    status: str
    description: str
    resolution_notes: Optional[str]
    resolution_time_hours: Optional[float]
    satisfaction_score: Optional[int]
    created_at: datetime
    resolved_at: Optional[datetime]
    customer: Optional[CustomerOut] = None

    class Config:
        from_attributes = True


# --- ML & Prediction Schemas ---
class LoanPredictionRequest(BaseModel):
    customer_age: int = Field(..., ge=18, le=100)
    annual_income: float = Field(..., gt=0)
    employment_status: str  # Employed, Self-Employed, Business, Unemployed
    credit_score: int = Field(..., ge=300, le=850)
    existing_loan_amount: float = Field(default=0.0, ge=0)
    loan_amount_requested: float = Field(..., gt=0)
    loan_tenure: int = Field(..., ge=6, le=360) # months
    monthly_expenses: float = Field(..., ge=0)
    debt_to_income_ratio: Optional[float] = None
    previous_repayment_history: int = Field(default=0, ge=0) # count of missed/late payments
    number_of_existing_loans: int = Field(default=0, ge=0)
    customer_identifier: Optional[str] = None

class ContributingFactor(BaseModel):
    feature: str
    value: Any
    impact: str  # "Increase Risk", "Decrease Risk", "Neutral"
    importance: float
    description: str

class LoanPredictionResponse(BaseModel):
    default_probability: float  # 0 to 100%
    model_confidence: float     # 0 to 100%
    risk_category: str          # "Low Risk", "Medium Risk", "High Risk"
    recommendation: str         # "Recommended for Approval", "Requires Manual Review", "Not Recommended"
    contributing_factors: List[ContributingFactor]
    explanation: str
    estimated_emi: float
    calculated_dti: float
    max_affordable_loan: float
    prediction_id: Optional[int] = None


# --- Eligibility Checker Schemas ---
class LoanEligibilityRequest(BaseModel):
    customer_id: Optional[str] = None
    loan_type: str = "Personal Loan" # Personal Loan, Home Loan, Vehicle Loan, Education Loan
    annual_income: float
    monthly_expenses: float
    credit_score: int
    requested_loan_amount: float
    loan_tenure: int # months
    existing_liabilities: float = 0.0
    employment_type: str = "Salaried" # Salaried, Self-Employed, Corporate, Public Sector
    repayment_history: int = 0 # missed payments

class LoanEligibilityResponse(BaseModel):
    loan_type: str
    requested_amount: float
    estimated_monthly_emi: float
    debt_to_income_ratio: float
    max_dti_allowed: float
    loan_eligibility_status: str # "Recommended for Approval", "Requires Manual Review", "Not Recommended"
    risk_category: str # "Low Risk", "Medium Risk", "High Risk"
    default_probability: float
    reasons: List[str]
    suggested_max_loan_amount: float
    policy_checks: Dict[str, bool]
    disclaimer: str


# --- Customer Segmentation Schemas ---
class SegmentSummary(BaseModel):
    segment_name: str
    cluster_id: int
    total_customers: int
    percentage: float
    total_revenue: float
    avg_annual_income: float
    avg_account_balance: float
    avg_spending: float
    avg_credit_score: float
    recommended_products: List[str]
    description: str

class CustomerSegmentationResponse(BaseModel):
    segments: List[SegmentSummary]
    total_customers_analyzed: int
    model_inertia: float
    features_used: List[str]


# --- Dashboard KPI & Chart Schemas ---
class DashboardKPIs(BaseModel):
    total_customers: int
    total_loans_distributed: int
    total_loan_amount: float
    outstanding_loan_amount: float
    loan_default_rate: float
    total_revenue: float
    customer_satisfaction_score: float
    total_active_accounts: int

class ChartDataPoint(BaseModel):
    name: str
    value: float
    extra: Optional[Dict[str, Any]] = None

class DashboardCharts(BaseModel):
    loan_distribution_by_type: List[ChartDataPoint]
    monthly_loan_approval_trends: List[Dict[str, Any]]
    loan_default_vs_repayment: List[Dict[str, Any]]
    revenue_by_product: List[ChartDataPoint]
    customer_segmentation: List[ChartDataPoint]
    complaints_by_category: List[ChartDataPoint]
    risk_distribution: List[ChartDataPoint]


# --- Revenue Schemas ---
class RevenueSummary(BaseModel):
    total_interest_income: float
    total_loan_revenue: float
    total_card_revenue: float
    total_service_charges: float
    total_operational_costs: float
    net_profit: float
    profit_margin: float

class TopCustomer(BaseModel):
    customer_id: str
    full_name: str
    segment: str
    total_revenue_generated: float
    account_balance: float
    active_loans_count: int

class BranchProfitability(BaseModel):
    branch_name: str
    city: str
    total_loans: int
    total_disbursed: float
    estimated_interest_income: float
    operational_cost: float
    net_contribution: float


# --- ETL Schemas ---
class ETLResult(BaseModel):
    status: str
    records_received: int
    records_cleaned: int
    duplicates_removed: int
    missing_values_handled: int
    message: str
