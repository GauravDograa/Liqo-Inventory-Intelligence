# ML Forecast Service

This is a standalone FastAPI microservice that implements the forecast API contract expected by the Liqo backend.

## Endpoints

- `GET /health`
- `GET /contract`
- `GET /selection`
- `GET /history`
- `POST /predict`

## Run locally

```bash
cd ml-forecast-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## Connect backend

Set this environment variable in the backend:

```env
ML_FORECAST_API_URL=http://localhost:8001
```

Then request:

- `/api/v2/recommendations?provider=external_ml_service`
- `/api/v2/simulation/run?provider=external_ml_service`

## Train the baseline model

1. Export the dataset from the backend:

```bash
curl http://localhost:5000/api/v2/ml-forecast/training-dataset -b "token=YOUR_COOKIE" > training_dataset.json
```

You can also tune the export:

```bash
curl "http://localhost:5000/api/v2/ml-forecast/training-dataset?historyWindowDays=180&horizonDays=30&stepDays=30" -b "token=YOUR_COOKIE" > training_dataset.json
```

2. Train the baseline artifact:

```bash
python train_baseline.py
```

3. Restart the FastAPI service. It will automatically load:

```text
artifacts/baseline_model.json
```

### One-command workflow

From [ml-forecast-service](D:/Liqo%20Inventory%20Intelligence%20Platform/ml-forecast-service), you can run:

```bash
python run_training_pipeline.py
```

Optional tuning:

```bash
python run_training_pipeline.py 180 30 30
```

This will:
- build the backend
- export a fresh `training_dataset.json`
- train and save `artifacts/baseline_model.json`
- train and save `artifacts/challenger_model.json`
- train and save `artifacts/lag_trend_model.json`
- evaluate all trained models
- update `artifacts/model_selection.json`
- append a run snapshot to `artifacts/model_history.json`

### Evaluate the baseline

```bash
python evaluate_baseline.py
```

This writes:

```text
artifacts/evaluation_report.json
artifacts/model_selection.json
artifacts/model_history.json
```

The report includes:
- train/test split sizes
- MAE, RMSE, and MAPE
- comparison of untuned baseline, trained baseline, trained challenger, and lag-trend model
- walk-forward time-based validation folds
- sample predictions on the held-out test set
- current winning model for inference
- historical snapshots of winner and scores across retraining runs

## Notes

- The current model becomes a learned baseline after `train_baseline.py` writes the artifact.
- The request and response shapes match the backend forecast contract.
- This is ready to be replaced later with a trained ML model implementation.
