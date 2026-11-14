from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import Customer
from app.schemas import CustomerOut, CustomerPagination, CustomerCreate

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=CustomerPagination)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    search: Optional[str] = Query(None),
    segment: Optional[str] = Query(None),
    risk_rating: Optional[str] = Query(None),
    branch_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Customer)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Customer.full_name.ilike(search_filter),
                Customer.email.ilike(search_filter),
                Customer.customer_id.ilike(search_filter)
            )
        )

    if segment and segment != "All":
        query = query.filter(Customer.segment == segment)

    if risk_rating and risk_rating != "All":
        query = query.filter(Customer.risk_rating == risk_rating)

    if branch_id:
        query = query.filter(Customer.branch_id == branch_id)

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    items = query.order_by(Customer.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, total_pages)
    }

@router.get("/{customer_id}")
def get_customer_details(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {
        "id": cust.id,
        "customer_id": cust.customer_id,
        "full_name": cust.full_name,
        "email": cust.email,
        "phone": cust.phone,
        "age": cust.age,
        "gender": cust.gender,
        "annual_income": cust.annual_income,
        "monthly_expenses": cust.monthly_expenses,
        "credit_score": cust.credit_score,
        "employment_status": cust.employment_status,
        "employment_type": cust.employment_type,
        "account_balance": cust.account_balance,
        "total_banking_products": cust.total_banking_products,
        "avg_monthly_spending": cust.avg_monthly_spending,
        "segment": cust.segment,
        "risk_rating": cust.risk_rating,
        "branch": {
            "id": cust.branch.id,
            "branch_code": cust.branch.branch_code,
            "branch_name": cust.branch.branch_name,
            "city": cust.branch.city
        } if cust.branch else None,
        "loans": [
            {
                "id": l.id,
                "loan_id": l.loan_id,
                "loan_type": l.loan_type,
                "loan_amount": l.loan_amount,
                "tenure_months": l.tenure_months,
                "interest_rate": l.interest_rate,
                "monthly_emi": l.monthly_emi,
                "outstanding_balance": l.outstanding_balance,
                "status": l.status,
                "default_flag": l.default_flag
            }
            for l in cust.loans
        ],
        "transactions": [
            {
                "id": t.id,
                "transaction_id": t.transaction_id,
                "transaction_type": t.transaction_type,
                "amount": t.amount,
                "status": t.status,
                "channel": t.channel,
                "date": t.date.isoformat()
            }
            for t in cust.transactions[:10]
        ],
        "complaints": [
            {
                "id": c.id,
                "complaint_id": c.complaint_id,
                "category": c.category,
                "priority": c.priority,
                "status": c.status,
                "description": c.description,
                "satisfaction_score": c.satisfaction_score
            }
            for c in cust.complaints
        ]
    }

@router.post("", response_model=CustomerOut)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    # Generate customer ID
    count = db.query(Customer).count()
    new_cid = f"CUST-{10000 + count + 1}"
    
    new_cust = Customer(
        customer_id=new_cid,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        age=payload.age,
        gender=payload.gender,
        annual_income=payload.annual_income,
        monthly_expenses=payload.monthly_expenses,
        credit_score=payload.credit_score,
        employment_status=payload.employment_status,
        employment_type=payload.employment_type,
        account_balance=payload.account_balance,
        total_banking_products=payload.total_banking_products,
        avg_monthly_spending=payload.avg_monthly_spending,
        segment=payload.segment or "Regular Customers",
        risk_rating=payload.risk_rating or "Low",
        branch_id=payload.branch_id
    )
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    return new_cust
