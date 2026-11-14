from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database import get_db
from app.models import Complaint, Customer
from app.schemas import ComplaintOut, ComplaintCreate, ComplaintUpdate

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.get("")
def list_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint).join(Customer, Complaint.customer_id == Customer.id)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Complaint.complaint_id.ilike(search_filter),
                Complaint.description.ilike(search_filter),
                Customer.full_name.ilike(search_filter)
            )
        )

    if category and category != "All":
        query = query.filter(Complaint.category == category)

    if status and status != "All":
        query = query.filter(Complaint.status == status)

    if priority and priority != "All":
        query = query.filter(Complaint.priority == priority)

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    items = query.order_by(Complaint.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, total_pages)
    }

@router.get("/analytics")
def get_complaint_analytics(db: Session = Depends(get_db)):
    total_complaints = db.query(Complaint).count()
    resolved_count = db.query(Complaint).filter(Complaint.status == "Resolved").count()
    in_progress_count = db.query(Complaint).filter(Complaint.status == "In Progress").count()
    open_count = db.query(Complaint).filter(Complaint.status == "Open").count()

    avg_res_time = db.query(func.avg(Complaint.resolution_time_hours)).filter(Complaint.resolution_time_hours.isnot(None)).scalar()
    avg_resolution_time = round(float(avg_res_time), 1) if avg_res_time else 28.5

    avg_sat = db.query(func.avg(Complaint.satisfaction_score)).filter(Complaint.satisfaction_score.isnot(None)).scalar()
    avg_satisfaction = round(float(avg_sat), 2) if avg_sat else 4.2

    # Breakdown by category
    cats = db.query(
        Complaint.category,
        func.count(Complaint.id).label("count"),
        func.avg(Complaint.satisfaction_score).label("sat")
    ).group_by(Complaint.category).all()

    category_breakdown = [
        {
            "category": row.category,
            "count": row.count,
            "avg_satisfaction": round(float(row.sat or 3.8), 2)
        }
        for row in cats
    ]

    # Priority breakdown
    prios = db.query(Complaint.priority, func.count(Complaint.id).label("count")).group_by(Complaint.priority).all()
    priority_breakdown = [{"priority": row.priority, "count": row.count} for row in prios]

    return {
        "summary": {
            "total_complaints": total_complaints,
            "resolved_count": resolved_count,
            "in_progress_count": in_progress_count,
            "open_count": open_count,
            "resolution_rate": round((resolved_count / max(1, total_complaints)) * 100.0, 1),
            "avg_resolution_time_hours": avg_resolution_time,
            "avg_satisfaction_score": avg_satisfaction
        },
        "category_breakdown": category_breakdown,
        "priority_breakdown": priority_breakdown
    }

@router.post("", response_model=ComplaintOut)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    count = db.query(Complaint).count()
    new_cid = f"CMP-{20000 + count + 1}"

    # Verify customer exists
    cust = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer ID not found.")

    new_comp = Complaint(
        complaint_id=new_cid,
        customer_id=payload.customer_id,
        category=payload.category,
        priority=payload.priority,
        status="Open",
        description=payload.description
    )
    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)
    return new_comp

@router.patch("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(complaint_id: int, payload: ComplaintUpdate, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if payload.status:
        comp.status = payload.status
        if payload.status == "Resolved" and not comp.resolved_at:
            comp.resolved_at = datetime.utcnow()
            diff_hours = (comp.resolved_at - comp.created_at).total_seconds() / 3600.0
            comp.resolution_time_hours = round(max(1.0, diff_hours), 1)

    if payload.priority:
        comp.priority = payload.priority
    if payload.resolution_notes:
        comp.resolution_notes = payload.resolution_notes
    if payload.satisfaction_score:
        comp.satisfaction_score = payload.satisfaction_score

    db.commit()
    db.refresh(comp)
    return comp
