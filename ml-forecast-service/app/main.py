from __future__ import annotations

from fastapi import FastAPI

from .model import predict
from .selection import load_history, load_selection
from .schemas import ApiEnvelope, MlForecastRequest, build_contract_response


app = FastAPI(
    title="Liqo ML Forecast Service",
    version="0.1.0",
    description="Standalone forecast microservice for Liqo inventory demand prediction.",
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ml-forecast-service"}


@app.get("/contract", response_model=ApiEnvelope)
def contract() -> ApiEnvelope:
    return ApiEnvelope(data=build_contract_response())


@app.get("/selection", response_model=ApiEnvelope)
def selection() -> ApiEnvelope:
    return ApiEnvelope(data=load_selection())


@app.get("/history", response_model=ApiEnvelope)
def history() -> ApiEnvelope:
    return ApiEnvelope(data=load_history())


@app.post("/predict", response_model=ApiEnvelope)
def forecast(request: MlForecastRequest) -> ApiEnvelope:
    return ApiEnvelope(data=predict(request))
