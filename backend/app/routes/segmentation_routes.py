from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import CustomerSegmentationResponse
from app.ml.segmentation import get_segmentation_analysis, train_customer_segmentation

router = APIRouter(prefix="/api/segmentation", tags=["Customer Segmentation"])

@router.get("", response_model=CustomerSegmentationResponse)
def get_segmentation(db: Session = Depends(get_db)):
    return get_segmentation_analysis(db)

@router.post("/recluster")
def run_reclustering():
    result = train_customer_segmentation()
    return {"status": "success", "message": "Customer segmentation re-clustered successfully.", "details": result}
