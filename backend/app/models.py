from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    username = Column(String(80), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="Loan Officer")  # Admin, Banking Manager, Loan Officer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    branch_code = Column(String(20), unique=True, index=True, nullable=False)
    branch_name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    manager_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customers = relationship("Customer", back_populates="branch")
    loans = relationship("Loan", back_populates="branch")


class BankingProduct(Base):
    __tablename__ = "banking_products"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # Savings Account, Personal Loan, Home Loan, Vehicle Loan, Education Loan, Credit Card
    interest_rate = Column(Float, nullable=False)
    min_credit_score = Column(Integer, default=600)
    base_fee = Column(Float, default=0.0)
    operational_cost_rate = Column(Float, default=0.015)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(30), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=True)
    
    annual_income = Column(Float, nullable=False)
    monthly_expenses = Column(Float, nullable=False)
    credit_score = Column(Integer, nullable=False)
    employment_status = Column(String(50), nullable=False)  # Employed, Self-Employed, Business, Unemployed
    employment_type = Column(String(50), nullable=True)    # Salaried, Freelance, Corporate, Public Sector
    
    account_balance = Column(Float, default=0.0)
    total_banking_products = Column(Integer, default=1)
    avg_monthly_spending = Column(Float, default=0.0)
    
    segment = Column(String(50), default="Regular Customers")  # Premium Customers, Regular Customers, Emerging Customers, High-Risk Customers
    risk_rating = Column(String(30), default="Low")            # Low, Medium, High
    
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    branch = relationship("Branch", back_populates="customers")
    loans = relationship("Loan", back_populates="customer", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="customer", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="customer", cascade="all, delete-orphan")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(String(30), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    
    loan_type = Column(String(50), nullable=False)  # Personal Loan, Home Loan, Vehicle Loan, Education Loan
    loan_amount = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    interest_rate = Column(Float, nullable=False)
    monthly_emi = Column(Float, nullable=False)
    outstanding_balance = Column(Float, nullable=False)
    
    status = Column(String(30), default="Approved")  # Approved, In Repayment, Fully Paid, Defaulted, Rejected
    default_flag = Column(Integer, default=0)         # 0 = No Default, 1 = Defaulted
    
    debt_to_income_ratio = Column(Float, default=0.0)
    previous_missed_payments = Column(Integer, default=0)
    
    approval_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="loans")
    branch = relationship("Branch", back_populates="loans")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(30), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    transaction_type = Column(String(50), nullable=False)  # Deposit, Withdrawal, Loan EMI, Credit Card Payment, Transfer, Service Charge
    amount = Column(Float, nullable=False)
    status = Column(String(30), default="Completed")       # Completed, Pending, Failed
    channel = Column(String(30), default="Online")          # Online, Mobile, Branch, ATM
    
    date = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(30), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    category = Column(String(80), nullable=False)  # Loan Processing Delays, Transaction Failures, Credit Card Issues, Account Access Problems, Incorrect Charges, Customer Service Issues
    priority = Column(String(30), default="Medium")  # Low, Medium, High, Critical
    status = Column(String(30), default="Open")      # Open, In Progress, Resolved
    
    description = Column(Text, nullable=False)
    resolution_notes = Column(Text, nullable=True)
    resolution_time_hours = Column(Float, nullable=True)
    satisfaction_score = Column(Integer, nullable=True)  # 1 to 5
    
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="complaints")


class LoanPrediction(Base):
    __tablename__ = "loan_predictions"

    id = Column(Integer, primary_key=True, index=True)
    customer_identifier = Column(String(60), nullable=True)
    customer_age = Column(Integer, nullable=False)
    annual_income = Column(Float, nullable=False)
    employment_status = Column(String(50), nullable=False)
    credit_score = Column(Integer, nullable=False)
    existing_loan_amount = Column(Float, default=0.0)
    loan_amount_requested = Column(Float, nullable=False)
    loan_tenure = Column(Integer, nullable=False)
    monthly_expenses = Column(Float, nullable=False)
    debt_to_income_ratio = Column(Float, nullable=False)
    previous_repayment_history = Column(Integer, default=0) # count of missed/late payments
    number_of_existing_loans = Column(Integer, default=0)
    
    default_probability = Column(Float, nullable=False)
    model_confidence = Column(Float, nullable=False)
    risk_category = Column(String(30), nullable=False)  # Low Risk, Medium Risk, High Risk
    recommendation = Column(String(50), nullable=False) # Recommended for Approval, Requires Manual Review, Not Recommended
    contributing_factors_json = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    max_affordable_loan = Column(Float, nullable=True)
    estimated_emi = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class CustomerSegmentRecord(Base):
    __tablename__ = "customer_segments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    segment_name = Column(String(50), nullable=False)
    cluster_id = Column(Integer, nullable=False)
    recommended_products_json = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(80), unique=True, index=True, nullable=False)
    value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
