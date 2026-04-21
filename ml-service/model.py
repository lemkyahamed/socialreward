import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

def generate_synthetic_data(num_samples=1000):
    """
    Generates mock data for training our MVP engagement verifier.
    Features: view_increase, like_increase, like_view_ratio, hours_since_last_check
    Target: is_suspicious (0 for natural, 1 for suspicious)
    """
    np.random.seed(42)
    
    data = []
    
    # Generate Natural Data (Label 0)
    for _ in range(num_samples // 2):
        view_increase = np.random.randint(10, 500)
        # Natural like ratio usually between 1% and 15%
        like_ratio = np.random.uniform(0.01, 0.15)
        like_increase = int(view_increase * like_ratio)
        hours = np.random.uniform(0.5, 4.0)
        
        data.append({
            'view_increase': view_increase,
            'like_increase': like_increase,
            'like_view_ratio': like_ratio,
            'hours_since_last_check': hours,
            'is_suspicious': 0
        })
        
    # Generate Suspicious Data (Label 1)
    for _ in range(num_samples // 2):
        # Suspicious patterns: massive views in short time, very low/zero likes
        view_increase = np.random.randint(1000, 10000)
        
        # Sometimes bots forget to like (ratio < 0.1%)
        # Or sometimes they over-like (ratio > 50%)
        if np.random.rand() > 0.5:
            like_ratio = np.random.uniform(0.0, 0.001)
        else:
            like_ratio = np.random.uniform(0.5, 1.0)
            
        like_increase = int(view_increase * like_ratio)
        hours = np.random.uniform(0.1, 1.0) # often unusually fast
        
        data.append({
            'view_increase': view_increase,
            'like_increase': like_increase,
            'like_view_ratio': like_ratio,
            'hours_since_last_check': hours,
            'is_suspicious': 1
        })
        
    df = pd.DataFrame(data)
    return df

def train_and_save_model():
    print("Generating synthetic data...")
    df = generate_synthetic_data(2000)
    
    X = df[['view_increase', 'like_increase', 'like_view_ratio', 'hours_since_last_check']]
    y = df['is_suspicious']
    
    print("Training RandomForest MVP model...")
    clf = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42)
    clf.fit(X, y)
    
    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(clf, f)
        
    print(f"Model saved to {model_path}")
    
if __name__ == "__main__":
    train_and_save_model()
