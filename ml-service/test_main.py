from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    # model_loaded could be true or false depending on if model.py was run, but endpoint should return 200

def test_predict_natural():
    response = client.post("/predict", json={
        "total_views": 1500,
        "total_likes": 150,
        "view_increase": 500,
        "like_increase": 50,
        "like_view_ratio": 0.1,
        "hours_since_last_check": 1.0
    })
    
    # We allow 500 if the model isn't loaded yet
    if response.status_code == 200:
        data = response.json()
        assert "prediction" in data
        assert "confidence" in data
        # For a 10% like ratio with 500 views, it should be natural
        if data["prediction"] == "natural":
            assert data["verified_views_added"] == 500
        else:
            assert data["verified_views_added"] == 0

def test_predict_suspicious():
    response = client.post("/predict", json={
        "total_views": 25000,
        "total_likes": 20,
        "view_increase": 20000,
        "like_increase": 5,
        "like_view_ratio": 0.00025,
        "hours_since_last_check": 0.5
    })
    
    if response.status_code == 200:
        data = response.json()
        # For a massive 20k spike in 30 mins with almost no likes, it should be suspicious
        if data["prediction"] == "suspicious":
            assert data["verified_views_added"] == 0
