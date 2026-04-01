from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = ROOT / "artifacts"
SELECTION_PATH = ARTIFACTS_DIR / "model_selection.json"
HISTORY_PATH = ARTIFACTS_DIR / "model_history.json"

MODEL_PATHS = {
    "trained_baseline": ARTIFACTS_DIR / "baseline_model.json",
    "trained_challenger": ARTIFACTS_DIR / "challenger_model.json",
    "trained_lag_trend": ARTIFACTS_DIR / "lag_trend_model.json",
}


def load_selection() -> dict:
    if not SELECTION_PATH.exists():
        return {
            "winner": "trained_baseline",
            "strategy": "fallback-default",
        }

    return json.loads(SELECTION_PATH.read_text())


def load_history() -> list[dict]:
    if not HISTORY_PATH.exists():
        return []

    return json.loads(HISTORY_PATH.read_text())


def resolve_model_choice(requested_model_name: str | None) -> str:
    normalized = (requested_model_name or "").strip().lower()

    manual_map = {
        "baseline": "trained_baseline",
        "trained_baseline": "trained_baseline",
        "challenger": "trained_challenger",
        "trained_challenger": "trained_challenger",
        "lag_trend": "trained_lag_trend",
        "trained_lag_trend": "trained_lag_trend",
        "auto": load_selection().get("winner", "trained_baseline"),
        "external-demand-forecast-v1": load_selection().get(
            "winner", "trained_baseline"
        ),
    }

    if normalized in manual_map:
        return manual_map[normalized]

    selection = load_selection()
    return selection.get("winner", "trained_baseline")


def load_selected_model(model_key: str) -> dict | None:
    path = MODEL_PATHS.get(model_key)
    if not path or not path.exists():
        return None

    return json.loads(path.read_text())
