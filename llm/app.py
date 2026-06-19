from fastapi import FastAPI, HTTPException
from chronos import ChronosPipeline
from contextlib import asynccontextmanager
import pandas as pd


from utils.schemas import ForecastRequest
from utils.helpers import prepare_series, forecast
import model

@asynccontextmanager
async def lifespan(app: FastAPI):

    model.MODEL = ChronosPipeline.from_pretrained(
        "amazon/chronos-t5-small"
    )

    yield

app = FastAPI(lifespan=lifespan)

@app.post("/predict")
def predict(req: ForecastRequest):

    if len(req.series) < 3:
        raise HTTPException(
            status_code=400,
            detail="Pelo menos 3 meses de histórico são necessários para um predição"
        )

    if req.horizon <= 0:
        raise HTTPException(
            status_code=400,
            detail="Horizonte de predição deve  ser maior que 0"
        )

    try:
        values, df = prepare_series(req.series)

        prediction = forecast(values, req.horizon)

        last_month = df["month"].max()

        future_months = pd.date_range(
            start=last_month + pd.offsets.MonthBegin(1),
            periods=req.horizon,
            freq="MS"
        )

        result = []

        for month, value in zip(future_months, prediction):
            result.append({
                "month": month.strftime("%m/%Y"),
                "predicted": float(value)
            })

        return {
            "input_points": len(values),
            "forecast_horizon": req.horizon,
            "predictions": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )