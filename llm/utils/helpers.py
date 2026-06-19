from typing import List
import torch
import numpy as np
import pandas as pd

from utils.schemas import DataPoint
import model.model


def prepare_series(series: List[DataPoint]):
    """
    Converts incoming data into sorted numeric series.
    """

    df = pd.DataFrame([x.dict() for x in series])

    if "month" not in df.columns or "value" not in df.columns:
        raise ValueError("Invalid input format")

    df["month"] = pd.to_datetime(df["month"])
    df = df.sort_values("month")

    values = df["value"].astype(float).values

    return values, df


def forecast(values, horizon):
    context = torch.from_numpy(
        np.asarray(values, dtype=np.float32)
    ).unsqueeze(0)

    predictions = model.MODEL.predict(
        context,
        prediction_length=horizon
    )

    mean_forecast = predictions.mean(dim=1)

    return mean_forecast[0].cpu().numpy().tolist()