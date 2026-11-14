import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import (
    Branch, BankingProduct, Customer, Loan, Transaction, Complaint, SystemSetting
)

def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    if annual_rate <= 0 or tenure_months <= 0:
        return round(principal / max(1, tenure_months), 2)
    monthly_rate = annual_rate / 12.0
    emi = (principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)) / (((1 + monthly_rate) ** tenure_months) - 1)
    return round(emi, 2)

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
    "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
    "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
    "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz"
]

CITIES = [
    ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"), ("Houston", "TX"),
    ("Phoenix", "AZ"), ("Philadelphia", "PA"), ("San Antonio", "TX"), ("San Diego", "CA"),
    ("Dallas", "TX"), ("San Jose", "CA"), ("Austin", "TX"), ("Jacksonville", "FL"),
    ("San Francisco", "CA"), ("Columbus", "OH"), ("Indianapolis", "IN"), ("Seattle", "WA"),
    ("Denver", "CO"), ("Washington", "DC"), ("Boston", "MA"), ("El Paso", "TX")
]

COMPLAINT_DESCRIPTIONS = {
    "Loan Processing Delays": [
        "Underwriting documentation review has exceeded 14 business days without an update.",
        "Delayed disbursal after loan sanction letter was issued.",
        "Property appraisal inspection report stuck in pending status for 3 weeks.",
        "Requested status on loan modification request; no response from loan officer."
    ],
    "Transaction Failures": [
        "ATM transaction deducted funds but cash was not dispensed at Downtown branch.",
        "Inter-bank wire transfer failed but account was debited.",
        "Recurring ACH auto-debit for mortgage payment failed with generic server timeout.",
        "Online merchant payment timed out; funds held in pending authorization for 7 days."
    ],
    "Credit Card Issues": [
        "Duplicate billing of international travel booking on credit card statement.",
        "Card unexpectedly blocked due to false fraud alert while traveling.",
        "Reward points redemption failed and cashback not credited to statement.",
        "Annual maintenance charge billed despite zero-fee card tier agreement."
    ],
    "Account Access Problems": [
        "Locked out of mobile banking application after OTP failure during biometric update.",
        "Password reset email verification link expired and 2FA SMS not received.",
        "Unable to add third-party payee due to security certificate error on desktop portal.",
        "Corporate user permission sync failed; unable to authorize payroll batches."
    ],
    "Incorrect Charges": [
        "Incurred overdraft fee despite linked savings cushion account balance exceeding required limit.",
        "Out-of-network ATM surcharge billed 3 times for single balance inquiry.",
        "Late fee charged despite payment being processed on the due date.",
        "Foreign transaction fee applied on domestic merchant billed in USD."
    ],
    "Customer Service Issues": [
        "Wait time exceeded 45 minutes on priority phone banking helpline.",
        "Branch teller was unhelpful regarding wire transfer documentation requirements.",
        "Relationship manager failed to return promised follow-up call regarding commercial rate discounts.",
        "Support chat ticket closed without resolving the underlying question."
    ]
}

def seed_database_and_generate_data(db: Session, customer_count: int = 5000):
    print(f"[*] Starting synthetic data generation (Target: {customer_count} records)...")
    
    # 1. System Settings
    settings = [
        ("max_dti_ratio", "0.45", "Maximum allowable debt-to-income ratio for automated approval"),
        ("min_credit_score_personal", "620", "Minimum credit score for personal loans"),
        ("min_credit_score_home", "650", "Minimum credit score for home loans"),
        ("benchmark_prime_rate", "0.065", "Federal benchmark prime lending rate"),
        ("default_risk_threshold_low", "0.25", "Default risk boundary between Low and Medium risk"),
        ("default_risk_threshold_high", "0.60", "Default risk boundary between Medium and High risk"),
    ]
    for key, val, desc in settings:
        if not db.query(SystemSetting).filter(SystemSetting.key == key).first():
            db.add(SystemSetting(key=key, value=val, description=desc))
    db.commit()

    # 2. Branches
    branches_data = [
        ("BR-NYC-01", "Metro Flagship Branch", "New York", "NY", "Victoria Sterling"),
        ("BR-CHI-02", "Downtown Financial Center", "Chicago", "IL", "David Kowalski"),
        ("BR-SFO-03", "West Coast Technology Hub", "San Francisco", "CA", "Elena Rostova"),
        ("BR-DAL-04", "Lone Star Commercial Branch", "Dallas", "TX", "Marcus Brody"),
        ("BR-SEA-05", "Puget Sound Regional Office", "Seattle", "WA", "Chloe Henderson"),
        ("BR-WDC-06", "Capital District Center", "Washington", "DC", "Arthur Pendelton")
    ]
    branch_objs = []
    for code, name, city, state, mgr in branches_data:
        b = db.query(Branch).filter(Branch.branch_code == code).first()
        if not b:
            b = Branch(branch_code=code, branch_name=name, city=city, state=state, manager_name=mgr)
            db.add(b)
            db.flush()
        branch_objs.append(b)
    db.commit()

    # 3. Banking Products
    products_data = [
        ("PROD-SAV-01", "High Yield Savings Account", "Savings Account", 0.045, 300, 0.0, 0.005),
        ("PROD-LN-PERS", "Flexible Personal Loan", "Personal Loan", 0.115, 620, 250.0, 0.015),
        ("PROD-LN-HOME", "Prime Fixed Home Loan", "Home Loan", 0.068, 650, 1200.0, 0.008),
        ("PROD-LN-AUTO", "Express Vehicle Loan", "Vehicle Loan", 0.082, 630, 350.0, 0.012),
        ("PROD-LN-EDU", "NextGen Education Loan", "Education Loan", 0.055, 600, 150.0, 0.006),
        ("PROD-CC-PLAT", "Platinum Rewards Credit Card", "Credit Card", 0.199, 700, 95.0, 0.020)
    ]
    product_objs = []
    for code, name, cat, rate, min_score, fee, op_cost in products_data:
        p = db.query(BankingProduct).filter(BankingProduct.product_code == code).first()
        if not p:
            p = BankingProduct(
                product_code=code, name=name, category=cat, interest_rate=rate,
                min_credit_score=min_score, base_fee=fee, operational_cost_rate=op_cost
            )
            db.add(p)
            db.flush()
        product_objs.append(p)
    db.commit()

    # Check if customers already exist
    existing_count = db.query(Customer).count()
    if existing_count >= customer_count:
        print(f"[+] Database already populated with {existing_count} customers. Skipping generation.")
        return

    np.random.seed(42)
    random.seed(42)

    # 4. Generate Customers & Loans
    loan_types = ["Personal Loan", "Home Loan", "Vehicle Loan", "Education Loan"]
    loan_type_weights = [0.35, 0.30, 0.20, 0.15]
    emp_statuses = ["Employed", "Self-Employed", "Business", "Unemployed"]
    emp_weights = [0.65, 0.20, 0.10, 0.05]
    emp_types = ["Salaried", "Corporate", "Public Sector", "Freelance"]

    customer_batch = []
    loan_batch = []
    transaction_batch = []
    complaint_batch = []

    print(f"[*] Synthesizing {customer_count} banking customer profiles...")

    for i in range(1, customer_count + 1):
        cust_id = f"CUST-{10000 + i}"
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        full_name = f"{fn} {ln}"
        email = f"{fn.lower()}.{ln.lower()}{i}@smartbank-demo.org"
        phone = f"+1-{random.randint(200,999)}-{random.randint(200,999)}-{random.randint(1000,9999)}"
        age = int(np.random.normal(42, 12))
        age = max(21, min(75, age))
        gender = random.choice(["Male", "Female", "Non-Binary"])

        # Income: Log-normal distribution
        # Median income around $65,000, ranging up to $350k
        annual_income = float(np.random.lognormal(mean=11.0, sigma=0.55))
        annual_income = round(max(24000.0, min(450000.0, annual_income)), 2)

        # Expenses: roughly 30% to 65% of monthly income
        monthly_income = annual_income / 12.0
        expense_ratio = random.uniform(0.32, 0.68)
        monthly_expenses = round(monthly_income * expense_ratio, 2)

        # Credit Score: Normal distribution centered at 685, std 80
        credit_score = int(np.random.normal(685, 85))
        credit_score = max(320, min(850, credit_score))

        emp_status = random.choices(emp_statuses, weights=emp_weights)[0]
        emp_type = random.choice(emp_types) if emp_status != "Unemployed" else "None"

        # Account Balance: correlated with income
        balance_factor = random.uniform(0.1, 1.8)
        account_balance = round(max(350.0, (annual_income * balance_factor) / 4.0), 2)
        total_products = random.randint(1, 5)
        avg_monthly_spending = round(monthly_expenses * random.uniform(0.8, 1.2), 2)

        # Segments & Risk Ratings
        if annual_income >= 120000 and credit_score >= 720 and account_balance >= 25000:
            segment = "Premium Customers"
        elif credit_score < 580 or (monthly_expenses / max(1, monthly_income) > 0.65):
            segment = "High-Risk Customers"
        elif annual_income < 50000 or age < 30:
            segment = "Emerging Customers"
        else:
            segment = "Regular Customers"

        if credit_score >= 720 and (monthly_expenses / monthly_income) < 0.45:
            risk_rating = "Low"
        elif credit_score >= 620:
            risk_rating = "Medium"
        else:
            risk_rating = "High"

        branch = random.choice(branch_objs)
        reg_date = datetime.utcnow() - timedelta(days=random.randint(60, 1000))

        customer = Customer(
            customer_id=cust_id,
            full_name=full_name,
            email=email,
            phone=phone,
            age=age,
            gender=gender,
            annual_income=annual_income,
            monthly_expenses=monthly_expenses,
            credit_score=credit_score,
            employment_status=emp_status,
            employment_type=emp_type,
            account_balance=account_balance,
            total_banking_products=total_products,
            avg_monthly_spending=avg_monthly_spending,
            segment=segment,
            risk_rating=risk_rating,
            branch_id=branch.id,
            created_at=reg_date
        )
        db.add(customer)
        db.flush() # get customer.id

        # Corresponding Loan Generation
        loan_id = f"LN-{2024}-{10000 + i}"
        loan_type = random.choices(loan_types, weights=loan_type_weights)[0]

        if loan_type == "Home Loan":
            base_amt = annual_income * random.uniform(2.5, 4.5)
            loan_amount = round(max(75000.0, min(800000.0, base_amt)), 2)
            tenure_months = random.choice([180, 240, 300, 360])
            interest_rate = 0.068 + (0.015 if credit_score < 680 else -0.005)
        elif loan_type == "Vehicle Loan":
            base_amt = annual_income * random.uniform(0.25, 0.6)
            loan_amount = round(max(12000.0, min(85000.0, base_amt)), 2)
            tenure_months = random.choice([36, 48, 60, 72])
            interest_rate = 0.082 + (0.02 if credit_score < 650 else 0.0)
        elif loan_type == "Education Loan":
            base_amt = random.uniform(15000.0, 70000.0)
            loan_amount = round(base_amt, 2)
            tenure_months = random.choice([60, 84, 120])
            interest_rate = 0.055 + (0.01 if credit_score < 640 else 0.0)
        else: # Personal Loan
            base_amt = annual_income * random.uniform(0.1, 0.4)
            loan_amount = round(max(3000.0, min(45000.0, base_amt)), 2)
            tenure_months = random.choice([12, 24, 36, 48, 60])
            interest_rate = 0.115 + (0.035 if credit_score < 620 else 0.0)

        monthly_emi = calculate_emi(loan_amount, interest_rate, tenure_months)
        total_monthly_obligations = monthly_expenses * 0.3 + monthly_emi
        dti = round(total_monthly_obligations / max(1.0, monthly_income), 3)

        # Realistic default probability formulation:
        # Logistic formula combining credit score, dti, employment, income
        cs_factor = (700.0 - credit_score) / 90.0
        dti_factor = (dti - 0.40) * 4.5
        emp_penalty = 1.2 if emp_status == "Unemployed" else (0.4 if emp_status == "Self-Employed" else -0.3)
        income_factor = -0.4 if annual_income > 90000 else 0.3

        z = -2.6 + cs_factor + dti_factor + emp_penalty + income_factor
        raw_default_prob = 1.0 / (1.0 + np.exp(-z))
        
        # Add slight stochastic noise
        default_prob = float(np.clip(raw_default_prob + np.random.normal(0, 0.05), 0.01, 0.99))
        
        # Decide default flag based on probability threshold with realistic variance
        is_default = 1 if np.random.rand() < default_prob else 0

        # Previous missed payments (overlapping Poisson distribution)
        if is_default:
            prev_missed = int(np.random.choice([1, 2, 3, 4, 5], p=[0.20, 0.35, 0.25, 0.12, 0.08]))
            status = "Defaulted"
            outstanding = round(loan_amount * random.uniform(0.5, 0.95), 2)
        else:
            prev_missed = int(np.random.choice([0, 1, 2, 3], p=[0.72, 0.18, 0.07, 0.03]))
            roll = random.random()
            if roll < 0.22:
                status = "Fully Paid"
                outstanding = 0.0
            elif roll < 0.85:
                status = "In Repayment"
                outstanding = round(loan_amount * random.uniform(0.15, 0.85), 2)
            else:
                status = "Approved"
                outstanding = loan_amount

        loan_record = Loan(
            loan_id=loan_id,
            customer_id=customer.id,
            branch_id=branch.id,
            loan_type=loan_type,
            loan_amount=loan_amount,
            tenure_months=tenure_months,
            interest_rate=round(interest_rate, 4),
            monthly_emi=monthly_emi,
            outstanding_balance=outstanding,
            status=status,
            default_flag=is_default,
            debt_to_income_ratio=dti,
            previous_missed_payments=prev_missed,
            approval_date=reg_date + timedelta(days=random.randint(2, 14)),
            created_at=reg_date
        )
        db.add(loan_record)

        # Generate 2 to 4 transactions for each customer
        txn_types = ["Deposit", "Withdrawal", "Loan EMI", "Credit Card Payment", "Transfer"]
        for t in range(random.randint(2, 4)):
            ttype = random.choice(txn_types)
            t_amt = round(random.uniform(50.0, 3200.0) if ttype != "Loan EMI" else monthly_emi, 2)
            txn = Transaction(
                transaction_id=f"TXN-{1000000 + i * 5 + t}",
                customer_id=customer.id,
                transaction_type=ttype,
                amount=t_amt,
                status="Completed" if random.random() > 0.03 else "Failed",
                channel=random.choice(["Online", "Mobile", "Branch", "ATM"]),
                date=reg_date + timedelta(days=random.randint(5, 180))
            )
            db.add(txn)

        # Generate complaints for ~12% of customers
        if random.random() < 0.12:
            cat = random.choice(list(COMPLAINT_DESCRIPTIONS.keys()))
            desc = random.choice(COMPLAINT_DESCRIPTIONS[cat])
            c_status = random.choices(["Resolved", "In Progress", "Open"], weights=[0.70, 0.20, 0.10])[0]
            res_hours = round(random.uniform(4.0, 96.0), 1) if c_status == "Resolved" else None
            sat_score = random.randint(3, 5) if c_status == "Resolved" else random.randint(1, 3)

            comp = Complaint(
                complaint_id=f"CMP-{20000 + i}",
                customer_id=customer.id,
                category=cat,
                priority=random.choices(["Low", "Medium", "High", "Critical"], weights=[0.25, 0.45, 0.20, 0.10])[0],
                status=c_status,
                description=desc,
                resolution_notes="Resolved via customer satisfaction protocol." if c_status == "Resolved" else None,
                resolution_time_hours=res_hours,
                satisfaction_score=sat_score,
                created_at=reg_date + timedelta(days=random.randint(20, 120)),
                resolved_at=reg_date + timedelta(days=random.randint(22, 125)) if c_status == "Resolved" else None
            )
            db.add(comp)

        # Batch commit every 500 records to maintain high efficiency
        if i % 500 == 0:
            db.commit()
            print(f"[>] Committed {i}/{customer_count} records...")

    db.commit()
    print(f"[+] Successfully generated and committed {customer_count} synthetic banking records.")

    # Generate sample CSV files for ETL upload testing
    generate_sample_csv_files(db)

def generate_sample_csv_files(db: Session):
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    sample_dir = os.path.join(base_dir, "data", "sample_csv")
    os.makedirs(sample_dir, exist_ok=True)

    # 1. Export sample customers
    customers = db.query(Customer).limit(200).all()
    c_data = []
    for c in customers:
        c_data.append({
            "customer_id": c.customer_id,
            "full_name": c.full_name,
            "email": c.email,
            "phone": c.phone,
            "age": c.age,
            "gender": c.gender,
            "annual_income": c.annual_income,
            "monthly_expenses": c.monthly_expenses,
            "credit_score": c.credit_score,
            "employment_status": c.employment_status,
            "employment_type": c.employment_type,
            "account_balance": c.account_balance,
            "total_banking_products": c.total_banking_products,
            "avg_monthly_spending": c.avg_monthly_spending,
            "segment": c.segment,
            "risk_rating": c.risk_rating
        })
    pd.DataFrame(c_data).to_csv(os.path.join(sample_dir, "sample_customers.csv"), index=False)

    # 2. Export sample loans
    loans = db.query(Loan).limit(200).all()
    l_data = []
    for l in loans:
        l_data.append({
            "loan_id": l.loan_id,
            "customer_id": l.customer_id,
            "loan_type": l.loan_type,
            "loan_amount": l.loan_amount,
            "tenure_months": l.tenure_months,
            "interest_rate": l.interest_rate,
            "monthly_emi": l.monthly_emi,
            "outstanding_balance": l.outstanding_balance,
            "status": l.status,
            "default_flag": l.default_flag,
            "debt_to_income_ratio": l.debt_to_income_ratio
        })
    pd.DataFrame(l_data).to_csv(os.path.join(sample_dir, "sample_loans.csv"), index=False)

    # 3. Export sample transactions
    txns = db.query(Transaction).limit(200).all()
    t_data = []
    for t in txns:
        t_data.append({
            "transaction_id": t.transaction_id,
            "customer_id": t.customer_id,
            "transaction_type": t.transaction_type,
            "amount": t.amount,
            "status": t.status,
            "channel": t.channel,
            "date": t.date.isoformat()
        })
    pd.DataFrame(t_data).to_csv(os.path.join(sample_dir, "sample_transactions.csv"), index=False)

    # 4. Export sample complaints
    cmps = db.query(Complaint).limit(200).all()
    cmp_data = []
    for comp in cmps:
        cmp_data.append({
            "complaint_id": comp.complaint_id,
            "customer_id": comp.customer_id,
            "category": comp.category,
            "priority": comp.priority,
            "status": comp.status,
            "description": comp.description,
            "resolution_notes": comp.resolution_notes or "",
            "resolution_time_hours": comp.resolution_time_hours or 0,
            "satisfaction_score": comp.satisfaction_score or 3
        })
    pd.DataFrame(cmp_data).to_csv(os.path.join(sample_dir, "sample_complaints.csv"), index=False)
    print(f"[+] Sample CSVs written to {sample_dir}")
