from datetime import date, timedelta
import json
from urllib.parse import urlencode
from urllib.request import urlopen

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI()
WEATHER_CACHE = {}

SCHOOL_HOLIDAYS = [
    (date(2020, 4, 6), date(2020, 4, 19)),
    (date(2020, 7, 1), date(2020, 8, 31)),
    (date(2020, 10, 26), date(2020, 11, 1)),
    (date(2020, 12, 21), date(2021, 1, 3)),
    (date(2021, 2, 15), date(2021, 2, 21)),
    (date(2021, 4, 5), date(2021, 4, 18)),
    (date(2021, 7, 1), date(2021, 8, 31)),
    (date(2021, 11, 1), date(2021, 11, 7)),
    (date(2021, 12, 27), date(2022, 1, 9)),
    (date(2022, 2, 28), date(2022, 3, 6)),
    (date(2022, 4, 4), date(2022, 4, 18)),
    (date(2022, 7, 1), date(2022, 8, 31)),
    (date(2022, 10, 31), date(2022, 11, 6)),
    (date(2022, 12, 26), date(2023, 1, 8)),
    (date(2023, 2, 20), date(2023, 2, 26)),
    (date(2023, 4, 3), date(2023, 4, 16)),
    (date(2023, 7, 1), date(2023, 8, 31)),
    (date(2023, 10, 30), date(2023, 11, 5)),
    (date(2023, 12, 25), date(2024, 1, 7)),
    (date(2024, 2, 12), date(2024, 2, 18)),
    (date(2024, 4, 1), date(2024, 4, 14)),
    (date(2024, 7, 1), date(2024, 8, 31)),
    (date(2024, 10, 28), date(2024, 11, 3)),
    (date(2024, 12, 23), date(2025, 1, 5)),
    (date(2025, 3, 3), date(2025, 3, 9)),
    (date(2025, 4, 7), date(2025, 4, 21)),
    (date(2025, 7, 1), date(2025, 8, 31)),
    (date(2025, 10, 27), date(2025, 11, 2)),
    (date(2025, 12, 22), date(2026, 1, 4)),
    (date(2026, 2, 16), date(2026, 2, 22)),
    (date(2026, 4, 6), date(2026, 4, 19)),
    (date(2026, 7, 1), date(2026, 8, 31)),
]


def easter_date(year):
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month = (h + l - 7 * m + 114) // 31
    day = ((h + l - 7 * m + 114) % 31) + 1
    return date(year, month, day)


def is_belgian_public_holiday(value):
    easter = easter_date(value.year)
    holidays = {
        date(value.year, 1, 1),
        easter + timedelta(days=1),
        date(value.year, 5, 1),
        easter + timedelta(days=39),
        easter + timedelta(days=50),
        date(value.year, 7, 21),
        date(value.year, 8, 15),
        date(value.year, 11, 1),
        date(value.year, 11, 11),
        date(value.year, 12, 25),
    }
    return value in holidays


def season_from_month(month):
    if month in (12, 1, 2):
        return 0
    if month in (3, 4, 5):
        return 1
    if month in (6, 7, 8):
        return 2
    return 3


def is_school_holiday(value):
    return any(start <= value <= end for start, end in SCHOOL_HOLIDAYS)


def get_open_meteo_weather(latitude, longitude, prediction_date, hour):
    cache_key = (round(latitude, 5), round(longitude, 5), prediction_date.isoformat())
    hourly_variables = [
        "temperature_2m",
        "apparent_temperature",
        "precipitation",
        "snowfall",
        "wind_speed_10m",
    ]

    if cache_key not in WEATHER_CACHE:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ",".join(hourly_variables),
            "timezone": "Europe/Brussels",
            "start_date": prediction_date.isoformat(),
            "end_date": prediction_date.isoformat(),
        }
        url = f"https://api.open-meteo.com/v1/forecast?{urlencode(params)}"

        try:
            with urlopen(url, timeout=10) as response:
                WEATHER_CACHE[cache_key] = json.loads(response.read().decode("utf-8"))
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Weather forecast unavailable: {e}")

    hourly = WEATHER_CACHE[cache_key].get("hourly", {})
    target_time = f"{prediction_date.isoformat()}T{hour:02d}:00"

    try:
        index = hourly["time"].index(target_time)
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=502,
            detail=f"Weather forecast unavailable for {target_time}",
        )

    try:
        return {
            "temperature_2m": float(hourly["temperature_2m"][index]),
            "apparent_temperature": float(hourly["apparent_temperature"][index]),
            "precipitation": float(hourly["precipitation"][index]),
            "snowfall": float(hourly["snowfall"][index]),
            "wind_speed_10m": float(hourly["wind_speed_10m"][index]),
        }
    except (KeyError, TypeError, ValueError) as e:
        raise HTTPException(status_code=502, detail=f"Incomplete weather forecast: {e}")

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

SITES_DATA = []
SITE_LOOKUP = {}
try:
    sites_path = os.path.join(os.path.dirname(__file__), "..", "complete_sites.csv")
    if os.path.exists(sites_path):
        df_sites = pd.read_csv(sites_path)
        for _, row in df_sites.iterrows():
            site = {
                "id": int(row["id"]),
                "external_counter_id": int(row["counter_id"]),
                "name": str(row["site_name"]),
                "municipality": str(row["municipality"]),
                "arrondissement": str(row["arrondissement"]),
                "lat": float(row["lat"]),
                "lng": float(row["lon"]),
                "infrastructure_deficit": float(row["infrastructure_deficit"]),
                "population": int(row["population"]),
            }
            SITES_DATA.append(site)
            SITE_LOOKUP[site["id"]] = site
        print("Successfully loaded site metadata for", len(SITES_DATA), "counters.")
except Exception as e:
    print("Error loading site metadata:", e)

class PredictionRequest(BaseModel):
    counter_id: int
    prediction_date: date
    hour: int
    lat: float
    lng: float

@app.post("/api/predict/bike")
def predict_bike(req: PredictionRequest):
    if model is None:
        return {"prediction": 0, "error": "Model not loaded"}

    prediction_date = req.prediction_date
    day_of_week = prediction_date.weekday()
    is_weekend = 1 if day_of_week >= 5 else 0
    site = SITE_LOOKUP.get(req.counter_id)
    latitude = site["lat"] if site else req.lat
    longitude = site["lng"] if site else req.lng
    weather = get_open_meteo_weather(latitude, longitude, prediction_date, req.hour)
    
    features = {
        'counter_id': req.counter_id,
        'hour': req.hour,
        'day_of_week': day_of_week,
        'month': prediction_date.month,
        'is_belgian_public_holiday': int(is_belgian_public_holiday(prediction_date)),
        'is_weekend': is_weekend,
        'latitude': latitude,
        'longitude': longitude,
        'temperature_2m': weather["temperature_2m"],
        'apparent_temperature': weather["apparent_temperature"],
        'wind_speed_10m': weather["wind_speed_10m"],
        'precipitation': weather["precipitation"],
        'snowfall': weather["snowfall"],
        'season': season_from_month(prediction_date.month),
        'is_school_holiday': int(is_school_holiday(prediction_date)),
        'lag_24h': 50.0, # Average lag
        'infrastructure_deficit': site["infrastructure_deficit"] if site else 2.5,
        'population': site["population"] if site else 50000.0,
        'hour_x_weekend': req.hour * is_weekend
    }

    feature_order = getattr(model, "feature_name_", list(features.keys()))
    df = pd.DataFrame([{name: features[name] for name in feature_order}])
    
    # Predict
    try:
        pred = model.predict(df)
        final_prediction = max(0, int(round(pred[0])))
        return {"prediction": final_prediction, "weather": weather}
    except Exception as e:
        print("Prediction error:", e)
        return {"prediction": 0, "error": str(e)}

@app.get("/api/sites")
def get_sites():
    if SITES_DATA:
        return {"status": "success", "data": SITES_DATA}
    return {"status": "error", "error": "Site metadata not available on backend."}

MCPI_DATA = None
try:
    mcpi_path = os.path.join(os.path.dirname(__file__), "..", "mcpi_check.csv")
    if os.path.exists(mcpi_path):
        df_mcpi = pd.read_csv(mcpi_path)
        df_mcpi["accident_rate_per_cyclist"] = (
            df_mcpi["accident_score"] / df_mcpi["yearly_bike_count"].replace(0, float("nan"))
        ).fillna(0)
        df_mcpi["cycling_adoption_rate"] = (
            df_mcpi["yearly_bike_count"] / df_mcpi["population"].replace(0, float("nan"))
        ).fillna(0)

        def minmax(series):
            min_value = series.min()
            max_value = series.max()
            if max_value == min_value:
                return series * 0
            return (series - min_value) / (max_value - min_value)

        df_mcpi["norm_accident_rate"] = minmax(df_mcpi["accident_rate_per_cyclist"])
        df_mcpi["norm_infrastructure_deficit"] = minmax(df_mcpi["infrastructure_deficit"])
        df_mcpi["norm_cycling_adoption_rate"] = minmax(df_mcpi["cycling_adoption_rate"])

        MCPI_DATA = {}
        for municipality, group in df_mcpi.groupby("municipality"):
            MCPI_DATA[municipality] = {}
            for _, row in group.iterrows():
                MCPI_DATA[municipality][str(int(row["year"]))] = {
                    "municipality": row["municipality"],
                    "year": int(row["year"]),
                    "yearly_bike_count": float(row["yearly_bike_count"]),
                    "infrastructure_deficit": float(row["infrastructure_deficit"]),
                    "population": int(row["population"]),
                    "arrondissement": row["arrondissement"],
                    "accident_score": float(row["accident_score"]),
                    "accident_rate_per_cyclist": float(row["accident_rate_per_cyclist"]),
                    "cycling_adoption_rate": float(row["cycling_adoption_rate"]),
                    "norm_accident_rate": float(row["norm_accident_rate"]),
                    "norm_infrastructure_deficit": float(row["norm_infrastructure_deficit"]),
                    "norm_cycling_adoption_rate": float(row["norm_cycling_adoption_rate"]),
                }
        print("Successfully loaded MCPI data for", len(MCPI_DATA), "municipalities.")
except Exception as e:
    print("Error loading MCPI data:", e)

@app.get("/api/mcpi")
def get_mcpi():
    if MCPI_DATA is not None:
        return {"status": "success", "data": MCPI_DATA}
    return {"status": "error", "error": "MCPI dataset not available on backend."}

@app.get("/")
def read_root():
    return {"message": "MDA Backend is running"}
