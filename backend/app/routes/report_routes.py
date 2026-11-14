import io
import csv
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Customer, Loan, Complaint

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/preview/{report_type}")
def get_report_preview(
    report_type: str,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    branch_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    rep_key = report_type.lower()
    
    if rep_key == "loan-default-risk":
        query = db.query(Loan).join(Customer, Loan.customer_id == Customer.id)
        if branch_id:
            query = query.filter(Loan.branch_id == branch_id)
        
        loans = query.limit(200).all()
        rows = [
            {
                "loan_id": l.loan_id,
                "customer_name": l.customer.full_name,
                "credit_score": l.customer.credit_score,
                "loan_type": l.loan_type,
                "loan_amount": l.loan_amount,
                "dti": round(l.debt_to_income_ratio * 100, 1),
                "status": l.status,
                "default_flag": "YES (Defaulted)" if l.default_flag == 1 else "NO (Performing)"
            }
            for l in loans
        ]
        return {
            "report_name": "Loan Default Risk & Credit Performance Audit",
            "generated_at": datetime.utcnow().isoformat(),
            "total_records": len(rows),
            "columns": ["Loan ID", "Borrower Name", "Credit Score", "Loan Category", "Sanctioned Amount", "DTI %", "Status", "Default Status"],
            "data": rows
        }

    elif rep_key == "customer-segmentation":
        custs = db.query(Customer).limit(200).all()
        rows = [
            {
                "customer_id": c.customer_id,
                "full_name": c.full_name,
                "segment": c.segment,
                "annual_income": c.annual_income,
                "account_balance": c.account_balance,
                "credit_score": c.credit_score,
                "risk_rating": c.risk_rating,
                "products_count": c.total_banking_products
            }
            for c in custs
        ]
        return {
            "report_name": "Customer Segmentation & Cross-Sell Analysis",
            "generated_at": datetime.utcnow().isoformat(),
            "total_records": len(rows),
            "columns": ["Customer ID", "Full Name", "Assigned Segment", "Annual Income", "Account Balance", "Credit Score", "Risk Tier", "Products Active"],
            "data": rows
        }

    elif rep_key == "loan-distribution":
        loans = db.query(Loan).join(Customer, Loan.customer_id == Customer.id).limit(200).all()
        rows = [
            {
                "loan_id": l.loan_id,
                "loan_type": l.loan_type,
                "borrower": l.customer.full_name,
                "amount": l.loan_amount,
                "tenure": f"{l.tenure_months} mo",
                "interest_rate": f"{round(l.interest_rate * 100, 2)}%",
                "monthly_emi": l.monthly_emi,
                "outstanding": l.outstanding_balance,
                "status": l.status
            }
            for l in loans
        ]
        return {
            "report_name": "Loan Distribution & Portfolio Exposure Report",
            "generated_at": datetime.utcnow().isoformat(),
            "total_records": len(rows),
            "columns": ["Loan ID", "Category", "Borrower", "Principal Amount", "Tenure", "Interest Rate", "Monthly EMI", "Outstanding Balance", "Status"],
            "data": rows
        }

    elif rep_key == "customer-complaint":
        complaints = db.query(Complaint).join(Customer, Complaint.customer_id == Customer.id).limit(200).all()
        rows = [
            {
                "ticket_id": c.complaint_id,
                "customer_name": c.customer.full_name,
                "category": c.category,
                "priority": c.priority,
                "status": c.status,
                "resolution_time": f"{c.resolution_time_hours} hrs" if c.resolution_time_hours else "Pending",
                "satisfaction": f"{c.satisfaction_score} / 5" if c.satisfaction_score else "N/A"
            }
            for c in complaints
        ]
        return {
            "report_name": "Customer Service & Grievance Resolution Audit",
            "generated_at": datetime.utcnow().isoformat(),
            "total_records": len(rows),
            "columns": ["Ticket ID", "Customer Name", "Category", "Priority", "Status", "Resolution Time", "Satisfaction Score"],
            "data": rows
        }

    elif rep_key == "revenue-profitability":
        top_custs = db.query(Customer).order_by(Customer.account_balance.desc()).limit(150).all()
        rows = []
        for c in top_custs:
            interest_rev = sum([l.loan_amount * l.interest_rate for l in c.loans if l.status != "Rejected"])
            fee_rev = c.account_balance * 0.015
            net_est = (interest_rev + fee_rev) * 0.72
            rows.append({
                "customer_id": c.customer_id,
                "full_name": c.full_name,
                "segment": c.segment,
                "account_balance": c.account_balance,
                "gross_revenue": round(interest_rev + fee_rev, 2),
                "estimated_margin": "72.0%",
                "net_profit_contribution": round(net_est, 2)
            })
        return {
            "report_name": "Revenue Yield & Customer Profitability Ledger",
            "generated_at": datetime.utcnow().isoformat(),
            "total_records": len(rows),
            "columns": ["Customer ID", "Customer Name", "Segment", "Liquid Balance", "Gross Revenue Contribution", "Net Margin %", "Net Contribution"],
            "data": rows
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid report type specified.")

@router.get("/export/csv/{report_type}")
def export_report_csv(
    report_type: str,
    db: Session = Depends(get_db)
):
    preview = get_report_preview(report_type=report_type, db=db)
    data = preview["data"]
    if not data:
        raise HTTPException(status_code=404, detail="No data available for export.")

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)

    output.seek(0)
    filename = f"SmartBank_{report_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
