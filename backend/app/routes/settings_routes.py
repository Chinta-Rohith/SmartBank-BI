from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, engine, Base
from app.models import SystemSetting, Branch, BankingProduct, Customer, Loan, Transaction, Complaint, User
from app.services.data_generator import seed_database_and_generate_data
from app.services.auth_service import seed_default_users
from app.ml.train_model import train_default_models
from app.ml.segmentation import train_customer_segmentation

router = APIRouter(prefix="/api/settings", tags=["Settings & Administration"])

@router.get("")
def get_system_settings(db: Session = Depends(get_db)):
    settings = db.query(SystemSetting).all()
    branches = db.query(Branch).all()
    products = db.query(BankingProduct).all()

    return {
        "policies": [
            {"key": s.key, "value": s.value, "description": s.description, "updated_at": s.updated_at.isoformat()}
            for s in settings
        ],
        "branches": [
            {"id": b.id, "branch_code": b.branch_code, "branch_name": b.branch_name, "city": b.city, "manager": b.manager_name}
            for b in branches
        ],
        "products": [
            {
                "id": p.id,
                "code": p.product_code,
                "name": p.name,
                "category": p.category,
                "interest_rate": p.interest_rate,
                "min_credit_score": p.min_credit_score,
                "base_fee": p.base_fee
            }
            for p in products
        ]
    }

@router.post("/policies/update")
def update_policy_setting(key: str, value: str, db: Session = Depends(get_db)):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting key not found")
    setting.value = value
    db.commit()
    return {"status": "success", "message": f"Updated policy setting '{key}' to '{value}'."}

@router.post("/reseed")
def reseed_database(count: int = 5000, db: Session = Depends(get_db)):
    # Clear customers, loans, transactions, complaints
    db.query(Transaction).delete()
    db.query(Complaint).delete()
    db.query(Loan).delete()
    db.query(Customer).delete()
    db.commit()

    # Regenerate
    seed_database_and_generate_data(db, customer_count=count)
    train_default_models()
    train_customer_segmentation()

    return {"status": "success", "message": f"Successfully reseeded database with {count} customer profiles and re-trained models."}
