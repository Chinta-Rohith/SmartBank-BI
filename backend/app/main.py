import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.services.auth_service import seed_default_users
from app.services.data_generator import seed_database_and_generate_data
from app.ml.train_model import train_default_models, MODELS_DIR
from app.ml.segmentation import train_customer_segmentation

# Route imports
from app.routes import (
    auth_routes,
    dashboard_routes,
    customer_routes,
    loan_routes,
    prediction_routes,
    eligibility_routes,
    segmentation_routes,
    complaint_routes,
    revenue_routes,
    etl_routes,
    report_routes,
    settings_routes
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Seed
    print("[*] Initializing SmartBank BI Database Tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed default staff/admin user accounts
        seed_default_users(db)

        # 2. Check if synthetic dataset exists; if not, generate 5000+ records
        seed_database_and_generate_data(db, customer_count=5000)

        # 3. Check if ML models are trained; if not, train them
        rf_path = os.path.join(MODELS_DIR, "random_forest_loan_default.joblib")
        if not os.path.exists(rf_path):
            print("[*] Model files not found. Training Random Forest & Baseline models...")
            train_default_models()
            train_customer_segmentation()
        else:
            print("[+] Trained ML model artifacts located.")

    except Exception as e:
        print(f"[!] Startup initialization error: {e}")
    finally:
        db.close()

    print("[+] SmartBank BI Backend Engine initialized successfully.")
    yield
    # Shutdown logic if any

app = FastAPI(
    title="SmartBank BI – Intelligent Banking Decision Support System API",
    description="Enterprise Banking Business Intelligence, Predictive Default Risk, and Portfolio Optimization Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for seamless communication with frontend Vite server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(customer_routes.router)
app.include_router(loan_routes.router)
app.include_router(prediction_routes.router)
app.include_router(eligibility_routes.router)
app.include_router(segmentation_routes.router)
app.include_router(complaint_routes.router)
app.include_router(revenue_routes.router)
app.include_router(etl_routes.router)
app.include_router(report_routes.router)
app.include_router(settings_routes.router)

@app.get("/")
def root_endpoint():
    return {
        "system": "SmartBank BI – Intelligent Banking Decision Support System",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_prefix": "/api"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
