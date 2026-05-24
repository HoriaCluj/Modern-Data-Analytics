from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import math

app = FastAPI()

# Allow CORS for the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the LightGBM model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "lgbm_tuned.pkl")
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    model = None
    print(f"Warning: Model not found at {MODEL_PATH}")

class PredictionRequest(BaseModel):
    hour: int
    lat: float
    lng: float
    temp: float
    rain: float
    wind: float

@app.post("/api/predict/bike")
def predict_bike(req: PredictionRequest):
    if model is None:
        return {"prediction": 0, "error": "Model not loaded"}

    # Map the incoming dashboard data to the model's feature space
    # For a real live dashboard, fields like 'day_of_week' would map to the current live date.
    # Here we default them to a generic 'Tuesday in Spring' for demonstration purposes.
    
    is_weekend = 1 if req.hour in [6, 7] else 0 # Mocking day_of_week logic (0=Monday, 6=Sunday)
    
    features = {
        'hour': [req.hour],
        'day_of_week': [1], # Tuesday
        'month': [4],       # April
        'is_belgian_public_holiday': [0],
        'is_weekend': [is_weekend],
        'latitude': [req.lat],
        'longitude': [req.lng],
        'temperature_2m': [req.temp],
        'apparent_temperature': [req.temp - (req.wind * 0.1)], # approximation
        'wind_speed_10m': [req.wind],
        'precipitation': [req.rain],
        'snowfall': [0.0],
        'season': [1], # Spring
        'is_school_holiday': [0],
        'lag_24h': [50.0], # Average lag
        'infrastructure_deficit': [2.5], # Average deficit
        'population': [50000.0], # Average population
        'hour_x_weekend': [req.hour * is_weekend]
    }
    
    df = pd.DataFrame(features)
    
    # Predict
    try:
        pred = model.predict(df)
        final_prediction = max(0, int(round(pred[0])))
        return {"prediction": final_prediction}
    except Exception as e:
        print("Prediction error:", e)
        return {"prediction": 0, "error": str(e)}

# Load MCPI accident data once at startup to keep endpoint fast
MCPI_DATA = None
try:
    acc_path = os.path.join(os.path.dirname(__file__), "..", "cleaned_bike_accidents.csv")
    if os.path.exists(acc_path):
        df_acc = pd.read_csv(acc_path, usecols=['TX_MUNTY_COLLISION_NL', 'DT_YEAR_COLLISION'])
        # Group by municipality and year
        grouped = df_acc.groupby(['TX_MUNTY_COLLISION_NL', 'DT_YEAR_COLLISION']).size().reset_index(name='accidents')
        
        MCPI_DATA = {}
        for m, g in grouped.groupby('TX_MUNTY_COLLISION_NL'):
            MCPI_DATA[m] = g.set_index('DT_YEAR_COLLISION')['accidents'].to_dict()
        print("Successfully loaded MCPI data for", len(MCPI_DATA), "municipalities.")
except Exception as e:
    print("Error loading MCPI data:", e)

@app.get("/api/mcpi")
def get_mcpi():
    if MCPI_DATA is not None:
        return {"status": "success", "data": MCPI_DATA}
    return {"status": "error", "error": "Accident dataset not available on backend."}

@app.get("/")
def read_root():
    return {"message": "MDA Backend is running"}
