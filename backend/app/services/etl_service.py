import io
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Customer, Loan, Transaction, Complaint, Branch

def process_customer_csv(file_contents: bytes, db: Session):
    df = pd.read_csv(io.BytesIO(file_contents))
    initial_count = len(df)
    
    # 1. Deduplication
    if "email" in df.columns:
        df = df.drop_duplicates(subset=["email"])
    if "customer_id" in df.columns:
        df = df.drop_duplicates(subset=["customer_id"])
    duplicates_removed = initial_count - len(df)

    # 2. Handle missing values
    missing_count = int(df.isnull().sum().sum())
    
    # Defaults & imputation
    if "age" in df.columns:
        df["age"] = df["age"].fillna(df["age"].median() if not df["age"].dropna().empty else 38).astype(int)
    if "annual_income" in df.columns:
        df["annual_income"] = df["annual_income"].fillna(df["annual_income"].median() if not df["annual_income"].dropna().empty else 60000.0)
    if "monthly_expenses" in df.columns:
        df["monthly_expenses"] = df["monthly_expenses"].fillna(df["annual_income"] / 24.0)
    if "credit_score" in df.columns:
        df["credit_score"] = df["credit_score"].fillna(680).astype(int)
    if "employment_status" in df.columns:
        df["employment_status"] = df["employment_status"].fillna("Employed")
    if "account_balance" in df.columns:
        df["account_balance"] = df["account_balance"].fillna(5000.0)
    if "segment" in df.columns:
        df["segment"] = df["segment"].fillna("Regular Customers")
    if "risk_rating" in df.columns:
        df["risk_rating"] = df["risk_rating"].fillna("Low")

    # 3. Insert or update in database
    default_branch = db.query(Branch).first()
    branch_id = default_branch.id if default_branch else None

    inserted_count = 0
    for idx, row in df.iterrows():
        cust_id = str(row.get("customer_id", f"CUST-IMP-{10000 + idx}"))
        email = str(row.get("email", f"imported_{idx}@demo.com"))
        
        # Check existing
        existing = db.query(Customer).filter((Customer.customer_id == cust_id) | (Customer.email == email)).first()
        if existing:
            # Update fields
            existing.annual_income = float(row.get("annual_income", existing.annual_income))
            existing.monthly_expenses = float(row.get("monthly_expenses", existing.monthly_expenses))
            existing.credit_score = int(row.get("credit_score", existing.credit_score))
            existing.account_balance = float(row.get("account_balance", existing.account_balance))
        else:
            new_cust = Customer(
                customer_id=cust_id,
                full_name=str(row.get("full_name", f"Imported Customer {idx}")),
                email=email,
                phone=str(row.get("phone", "+1-555-0100")),
                age=int(row.get("age", 35)),
                gender=str(row.get("gender", "Other")),
                annual_income=float(row.get("annual_income", 55000.0)),
                monthly_expenses=float(row.get("monthly_expenses", 2200.0)),
                credit_score=int(row.get("credit_score", 670)),
                employment_status=str(row.get("employment_status", "Employed")),
                employment_type=str(row.get("employment_type", "Salaried")),
                account_balance=float(row.get("account_balance", 4500.0)),
                total_banking_products=int(row.get("total_banking_products", 2)),
                avg_monthly_spending=float(row.get("avg_monthly_spending", 1800.0)),
                segment=str(row.get("segment", "Regular Customers")),
                risk_rating=str(row.get("risk_rating", "Low")),
                branch_id=branch_id
            )
            db.add(new_cust)
            inserted_count += 1

    db.commit()

    return {
        "status": "success",
        "records_received": initial_count,
        "records_cleaned": len(df),
        "duplicates_removed": duplicates_removed,
        "missing_values_handled": missing_count,
        "message": f"Successfully processed {len(df)} customer records ({inserted_count} new inserts)."
    }

def process_loan_csv(file_contents: bytes, db: Session):
    df = pd.read_csv(io.BytesIO(file_contents))
    initial_count = len(df)
    
    if "loan_id" in df.columns:
        df = df.drop_duplicates(subset=["loan_id"])
    duplicates_removed = initial_count - len(df)
    missing_count = int(df.isnull().sum().sum())

    # Impute defaults
    if "loan_amount" in df.columns:
        df["loan_amount"] = df["loan_amount"].fillna(25000.0)
    if "tenure_months" in df.columns:
        df["tenure_months"] = df["tenure_months"].fillna(36).astype(int)
    if "interest_rate" in df.columns:
        df["interest_rate"] = df["interest_rate"].fillna(0.085)
    if "status" in df.columns:
        df["status"] = df["status"].fillna("Approved")

    first_customer = db.query(Customer).first()
    first_cust_id = first_customer.id if first_customer else 1
    default_branch = db.query(Branch).first()
    branch_id = default_branch.id if default_branch else None

    inserted_count = 0
    for idx, row in df.iterrows():
        loan_id = str(row.get("loan_id", f"LN-IMP-{10000 + idx}"))
        existing = db.query(Loan).filter(Loan.loan_id == loan_id).first()
        if not existing:
            cust_id = int(row.get("customer_id", first_cust_id))
            # Verify customer exists
            if not db.query(Customer).filter(Customer.id == cust_id).first():
                cust_id = first_cust_id

            amt = float(row.get("loan_amount", 20000.0))
            tenure = int(row.get("tenure_months", 36))
            rate = float(row.get("interest_rate", 0.08))
            emi = float(row.get("monthly_emi", (amt * (1 + rate * tenure / 12)) / tenure))
            
            new_loan = Loan(
                loan_id=loan_id,
                customer_id=cust_id,
                branch_id=branch_id,
                loan_type=str(row.get("loan_type", "Personal Loan")),
                loan_amount=amt,
                tenure_months=tenure,
                interest_rate=rate,
                monthly_emi=round(emi, 2),
                outstanding_balance=float(row.get("outstanding_balance", amt * 0.7)),
                status=str(row.get("status", "In Repayment")),
                default_flag=int(row.get("default_flag", 0)),
                debt_to_income_ratio=float(row.get("debt_to_income_ratio", 0.35))
            )
            db.add(new_loan)
            inserted_count += 1
    
    db.commit()

    return {
        "status": "success",
        "records_received": initial_count,
        "records_cleaned": len(df),
        "duplicates_removed": duplicates_removed,
        "missing_values_handled": missing_count,
        "message": f"Successfully ingested {len(df)} loan records ({inserted_count} new loans added)."
    }

def process_transaction_csv(file_contents: bytes, db: Session):
    df = pd.read_csv(io.BytesIO(file_contents))
    initial_count = len(df)
    
    if "transaction_id" in df.columns:
        df = df.drop_duplicates(subset=["transaction_id"])
    duplicates_removed = initial_count - len(df)
    missing_count = int(df.isnull().sum().sum())

    first_customer = db.query(Customer).first()
    first_cust_id = first_customer.id if first_customer else 1

    inserted_count = 0
    for idx, row in df.iterrows():
        tx_id = str(row.get("transaction_id", f"TX-IMP-{100000 + idx}"))
        existing = db.query(Transaction).filter(Transaction.transaction_id == tx_id).first()
        if not existing:
            cust_id = int(row.get("customer_id", first_cust_id))
            if not db.query(Customer).filter(Customer.id == cust_id).first():
                cust_id = first_cust_id

            txn = Transaction(
                transaction_id=tx_id,
                customer_id=cust_id,
                transaction_type=str(row.get("transaction_type", "Deposit")),
                amount=float(row.get("amount", 250.0)),
                status=str(row.get("status", "Completed")),
                channel=str(row.get("channel", "Online")),
                date=datetime.utcnow()
            )
            db.add(txn)
            inserted_count += 1

    db.commit()

    return {
        "status": "success",
        "records_received": initial_count,
        "records_cleaned": len(df),
        "duplicates_removed": duplicates_removed,
        "missing_values_handled": missing_count,
        "message": f"Successfully processed {len(df)} transaction records ({inserted_count} records saved)."
    }

def process_complaint_csv(file_contents: bytes, db: Session):
    df = pd.read_csv(io.BytesIO(file_contents))
    initial_count = len(df)

    if "complaint_id" in df.columns:
        df = df.drop_duplicates(subset=["complaint_id"])
    duplicates_removed = initial_count - len(df)
    missing_count = int(df.isnull().sum().sum())

    first_customer = db.query(Customer).first()
    first_cust_id = first_customer.id if first_customer else 1

    inserted_count = 0
    for idx, row in df.iterrows():
        cmp_id = str(row.get("complaint_id", f"CMP-IMP-{10000 + idx}"))
        existing = db.query(Complaint).filter(Complaint.complaint_id == cmp_id).first()
        if not existing:
            cust_id = int(row.get("customer_id", first_cust_id))
            if not db.query(Customer).filter(Customer.id == cust_id).first():
                cust_id = first_cust_id

            cmp = Complaint(
                complaint_id=cmp_id,
                customer_id=cust_id,
                category=str(row.get("category", "Customer Service Issues")),
                priority=str(row.get("priority", "Medium")),
                status=str(row.get("status", "Open")),
                description=str(row.get("description", "Standard inquiry.")),
                resolution_notes=str(row.get("resolution_notes", "")),
                resolution_time_hours=float(row.get("resolution_time_hours", 24.0)) if pd.notnull(row.get("resolution_time_hours")) else None,
                satisfaction_score=int(row.get("satisfaction_score", 4)) if pd.notnull(row.get("satisfaction_score")) else None
            )
            db.add(cmp)
            inserted_count += 1

    db.commit()

    return {
        "status": "success",
        "records_received": initial_count,
        "records_cleaned": len(df),
        "duplicates_removed": duplicates_removed,
        "missing_values_handled": missing_count,
        "message": f"Successfully processed {len(df)} complaints ({inserted_count} new tickets added)."
    }
