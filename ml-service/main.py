from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import os
import pandas as pd

app = FastAPI(title="Creator Rewards Verifier ML API", version="1.0.0")

# Load model on startup
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
try:
    with open(model_path, 'rb') as f:
        clf = pickle.load(f)
except FileNotFoundError:
    print("WARNING: model.pkl not found. Please run model.py first.")
    clf = None

class PredictionRequest(BaseModel):
    total_views: int
    total_likes: int
    view_increase: int
    like_increase: int
    like_view_ratio: float
    hours_since_last_check: float

class PredictionResponse(BaseModel):
    prediction: str # "natural" or "suspicious"
    confidence: float
    verified_views_added: int
    verified_likes_added: int
    model_version: str

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": clf is not None}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    if clf is None:
        raise HTTPException(status_code=500, detail="ML Model not loaded on server.")
        
    # Prepare feature matching model training
    features = pd.DataFrame([{
        'view_increase': data.view_increase,
        'like_increase': data.like_increase,
        'like_view_ratio': data.like_view_ratio,
        'hours_since_last_check': data.hours_since_last_check
    }])
    
    # 0 = natural, 1 = suspicious
    prediction_num = clf.predict(features)[0]
    probabilities = clf.predict_proba(features)[0]
    
    confidence = float(probabilities[prediction_num])
    
    pred_str = "suspicious" if prediction_num == 1 else "natural"
    
    # Calculate verified additions
    # If suspicious, we grant 0 verified additions
    # If natural, we grant 100% of the increase
    # (Advanced Phase: could scale by confidence)
    
    if pred_str == "suspicious":
        verified_views = 0
        verified_likes = 0
    else:
        verified_views = data.view_increase
        verified_likes = data.like_increase

    return PredictionResponse(
        prediction=pred_str,
        confidence=confidence,
        verified_views_added=verified_views,
        verified_likes_added=verified_likes,
        model_version="1.0.0-mvp"
    )
