from pydantic import BaseModel
from typing import List


class DataPoint(BaseModel):
    month: str
    value: float

class ForecastRequest(BaseModel):
    horizon: int
    series: List[DataPoint]