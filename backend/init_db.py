import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.services.auth_service import seed_default_users
from app.services.data_generator import seed_database_and_generate_data
from app.ml.train_model import train_default_models
from app.ml.segmentation import train_customer_segmentation

def main():
    print("==================================================================")
    print("  SmartBank BI: System Database Initialization & ML Pipeline     ")
    print("==================================================================")
    
    print("\n[Step 1/4] Creating SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("\n[Step 2/4] Seeding default authentication credentials (Admin, Manager, Loan Officer)...")
        seed_default_users(db)

        print("\n[Step 3/4] Synthesizing 5,000+ realistic banking profiles & financial records...")
        seed_database_and_generate_data(db, customer_count=5000)

        print("\n[Step 4/4] Training Random Forest classifier & K-Means clustering engine...")
        rf_metrics = train_default_models()
        seg_metrics = train_customer_segmentation()

        print("\n==================================================================")
        print("  SMARTBANK BI INITIALIZATION COMPLETE!                           ")
        print("==================================================================")
        if rf_metrics:
            print(f"  Random Forest Accuracy: {rf_metrics['random_forest']['accuracy'] * 100:.1f}%")
            print(f"  Random Forest ROC-AUC : {rf_metrics['random_forest']['roc_auc']:.3f}")
            print(f"  Logistic Reg Accuracy : {rf_metrics['logistic_regression']['accuracy'] * 100:.1f}%")
        print("==================================================================")

    finally:
        db.close()

if __name__ == "__main__":
    main()
