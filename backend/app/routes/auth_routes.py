from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import Token, UserLogin, UserOut
from app.services.auth_service import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 specification uses "username", which corresponds to our user's email
    user = db.query(User).filter((User.email == form_data.username) | (User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive account")

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "username": user.username}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email
    }

@router.post("/login", response_model=Token)
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "username": user.username}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email
    }

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
def get_demo_accounts():
    return [
        {
            "role": "Admin",
            "email": "admin@smartbank.com",
            "password": "Admin@123",
            "name": "Alexander Vance",
            "title": "Chief Risk Officer",
            "access": "Full access to all modules, ETL, ML retraining, and administrative settings"
        },
        {
            "role": "Banking Manager",
            "email": "manager@smartbank.com",
            "password": "Manager@123",
            "name": "Sarah Jenkins",
            "title": "Banking Operations Manager",
            "access": "Branch operations, revenue analytics, customer segmentation & complaint oversight"
        },
        {
            "role": "Loan Officer",
            "email": "loanofficer@smartbank.com",
            "password": "Officer@123",
            "name": "Marcus Chen",
            "title": "Senior Underwriter",
            "access": "Customer portfolio, loan approval pipeline, ML default prediction & eligibility checker"
        }
    ]
