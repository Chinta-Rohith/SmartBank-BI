import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Customer, Loan, Transaction, Complaint
from app.schemas import ETLResult
from app.services.etl_service import (
    process_customer_csv, process_loan_csv, process_transaction_csv, process_complaint_csv
)

router = APIRouter(prefix="/api/etl", tags=["Data Management & ETL"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAMPLE_DIR = os.path.join(BASE_DIR, "data", "sample_csv")

@router.get("/stats")
def get_dataset_statistics(db: Session = Depends(get_db)):
    return {
        "customers_count": db.query(Customer).count(),
        "loans_count": db.query(Loan).count(),
        "transactions_count": db.query(Transaction).count(),
        "complaints_count": db.query(Complaint).count(),
        "database_engine": "SQLite 3 with SQLAlchemy 2.0 ORM",
        "last_synced": "Real-time live database synchronization"
    }

@router.post("/upload/customers", response_model=ETLResult)
async def upload_customers_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are permitted.")
    contents = await file.read()
    try:
        return process_customer_csv(contents, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ETL Customer Ingestion Error: {str(e)}")

@router.post("/upload/loans", response_model=ETLResult)
async def upload_loans_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are permitted.")
    contents = await file.read()
    try:
        return process_loan_csv(contents, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ETL Loan Ingestion Error: {str(e)}")

@router.post("/upload/transactions", response_model=ETLResult)
async def upload_transactions_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are permitted.")
    contents = await file.read()
    try:
        return process_transaction_csv(contents, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ETL Transaction Ingestion Error: {str(e)}")

@router.post("/upload/complaints", response_model=ETLResult)
async def upload_complaints_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are permitted.")
    contents = await file.read()
    try:
        return process_complaint_csv(contents, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ETL Complaint Ingestion Error: {str(e)}")

@router.get("/sample-files/{file_type}")
def download_sample_csv(file_type: str):
    valid_files = {
        "customers": "sample_customers.csv",
        "loans": "sample_loans.csv",
        "transactions": "sample_transactions.csv",
        "complaints": "sample_complaints.csv"
    }
    filename = valid_files.get(file_type.lower())
    if not filename:
        raise HTTPException(status_code=404, detail="Requested sample file type not found.")
    
    file_path = os.path.join(SAMPLE_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Sample file {filename} not yet generated on server.")
    
    return FileResponse(path=file_path, filename=filename, media_type="text/csv")
