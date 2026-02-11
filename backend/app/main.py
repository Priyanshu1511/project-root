from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
from app.analysis import analyze_water_data

app = FastAPI(title="Water Compliance API")

# Enable CORS (IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "API Running"}

@app.post("/analyze")
async def analyze_excel(file: UploadFile = File(...)):

    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))

    result = analyze_water_data(df)

    return result
