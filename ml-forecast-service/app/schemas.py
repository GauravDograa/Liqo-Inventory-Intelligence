from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


DemandSignalSource = Literal[
    "historical_velocity",
    "ml_forecast",
    "external_ml_service",
    "forecast_override",
]


class DemandSignalContext(BaseModel):
    organizationId: str
    horizonDays: int
    historyWindowDays: int
    storeId: str | None = None


class ForecastFeatureRow(BaseModel):
    organization_id: str
    store_id: str
    sku_id: str
    category: str | None = None
    anchor_month: int
    anchor_quarter: int
    anchor_week_of_year: int
    horizon_days: int
    history_window_days: int
    units_sold_window: float
    units_sold_last_30d: float
    units_sold_last_90d: float
    recent_demand_share: float
    observed_velocity_per_day: float
    previous_window_units: float
    short_term_trend_ratio: float
    planning_velocity_floor: float
    current_units: float
    stock_age_days: float
    target_coverage_days: float
    safety_coverage_days: float
    gross_margin_pct: float | None = None
    mrp: float
    acquisition_cost: float
    deadstock_threshold_days: float
    store_rank_in_velocity: float
    peer_average_units: float
    peer_gap_units: float
    seasonal_index: float
    store_demand_confidence: float


class MlForecastRequest(BaseModel):
    modelName: str
    source: DemandSignalSource
    generatedAt: datetime
    context: DemandSignalContext
    features: list[ForecastFeatureRow]


class MlForecastPrediction(BaseModel):
    storeId: str
    skuId: str
    predictedDemandUnits: float
    predictedVelocityPerDay: float
    confidence: float
    source: DemandSignalSource
    explanation: str | None = None


class MlForecastResponse(BaseModel):
    modelName: str
    predictions: list[MlForecastPrediction]


class FeatureDefinition(BaseModel):
    key: str
    label: str
    type: Literal["string", "number"]
    significance: str


class ContractResponse(BaseModel):
    endpoint: str
    fallbackEndpoint: str
    supportedSources: list[DemandSignalSource]
    defaultModelName: str
    defaultHorizonDays: int
    defaultHistoryWindowDays: int
    featureDefinitions: list[FeatureDefinition]


class ApiEnvelope(BaseModel):
    success: bool = True
    data: dict | list | str | int | float | ContractResponse | MlForecastResponse


EXAMPLE_FEATURE_DEFINITIONS: list[FeatureDefinition] = [
    FeatureDefinition(
        key="organization_id",
        label="Organization ID",
        type="string",
        significance="Supports tenant-safe training and prediction boundaries.",
    ),
    FeatureDefinition(
        key="store_id",
        label="Store ID",
        type="string",
        significance="Captures location-specific demand behavior and store effects.",
    ),
    FeatureDefinition(
        key="sku_id",
        label="SKU ID",
        type="string",
        significance="Lets the model learn item-level demand patterns.",
    ),
    FeatureDefinition(
        key="category",
        label="Category",
        type="string",
        significance="Separates appliance categories with different demand cycles.",
    ),
    FeatureDefinition(
        key="anchor_month",
        label="Anchor Month",
        type="number",
        significance="Lets the model learn month-specific seasonality.",
    ),
    FeatureDefinition(
        key="anchor_quarter",
        label="Anchor Quarter",
        type="number",
        significance="Captures broader seasonal demand phases.",
    ),
    FeatureDefinition(
        key="anchor_week_of_year",
        label="Anchor Week of Year",
        type="number",
        significance="Adds finer time-position context within the year.",
    ),
    FeatureDefinition(
        key="horizon_days",
        label="Forecast Horizon",
        type="number",
        significance="Defines the future demand window being predicted.",
    ),
    FeatureDefinition(
        key="history_window_days",
        label="History Window",
        type="number",
        significance="Explains how much trailing sales history informed the feature row.",
    ),
    FeatureDefinition(
        key="units_sold_window",
        label="Units Sold in Window",
        type="number",
        significance="Baseline realized demand volume.",
    ),
    FeatureDefinition(
        key="units_sold_last_30d",
        label="Units Sold Last 30 Days",
        type="number",
        significance="Captures the most recent demand burst or slowdown.",
    ),
    FeatureDefinition(
        key="units_sold_last_90d",
        label="Units Sold Last 90 Days",
        type="number",
        significance="Adds medium-term demand context between short-term noise and the full history window.",
    ),
    FeatureDefinition(
        key="recent_demand_share",
        label="Recent Demand Share",
        type="number",
        significance="Measures what share of total history demand occurred recently.",
    ),
    FeatureDefinition(
        key="observed_velocity_per_day",
        label="Observed Velocity Per Day",
        type="number",
        significance="Recent sales intensity used by the deterministic engine.",
    ),
    FeatureDefinition(
        key="previous_window_units",
        label="Previous Window Units",
        type="number",
        significance="Adds lag history so the model can compare current and prior demand windows.",
    ),
    FeatureDefinition(
        key="short_term_trend_ratio",
        label="Short-Term Trend Ratio",
        type="number",
        significance="Captures momentum between the latest history window and the previous one.",
    ),
    FeatureDefinition(
        key="planning_velocity_floor",
        label="Planning Velocity Floor",
        type="number",
        significance="Minimum operational demand assumption used in planning.",
    ),
    FeatureDefinition(
        key="current_units",
        label="Current Saleable Units",
        type="number",
        significance="Current inventory available to satisfy demand.",
    ),
    FeatureDefinition(
        key="stock_age_days",
        label="Stock Age Days",
        type="number",
        significance="Important for aging-sensitive demand and deadstock risk.",
    ),
    FeatureDefinition(
        key="target_coverage_days",
        label="Target Coverage Days",
        type="number",
        significance="Business planning target for healthy coverage.",
    ),
    FeatureDefinition(
        key="safety_coverage_days",
        label="Safety Coverage Days",
        type="number",
        significance="Minimum stock buffer expected operationally.",
    ),
    FeatureDefinition(
        key="gross_margin_pct",
        label="Gross Margin %",
        type="number",
        significance="Lets downstream ranking value profitable demand more highly.",
    ),
    FeatureDefinition(
        key="mrp",
        label="MRP",
        type="number",
        significance="Supports revenue opportunity calculations.",
    ),
    FeatureDefinition(
        key="acquisition_cost",
        label="Acquisition Cost",
        type="number",
        significance="Supports capital-efficiency and margin-aware forecasting.",
    ),
    FeatureDefinition(
        key="deadstock_threshold_days",
        label="Deadstock Threshold Days",
        type="number",
        significance="Aligns prediction behavior with category aging rules.",
    ),
    FeatureDefinition(
        key="store_rank_in_velocity",
        label="Store Rank in Velocity",
        type="number",
        significance="Measures store strength for a SKU relative to peers.",
    ),
    FeatureDefinition(
        key="peer_average_units",
        label="Peer Average Units",
        type="number",
        significance="Shows normal stock level across stores for the same SKU.",
    ),
    FeatureDefinition(
        key="peer_gap_units",
        label="Peer Gap Units",
        type="number",
        significance="Shows whether a store is over- or under-stocked relative to peers.",
    ),
    FeatureDefinition(
        key="seasonal_index",
        label="Seasonal Index",
        type="number",
        significance="Provides a slot for seasonality-sensitive modeling.",
    ),
    FeatureDefinition(
        key="store_demand_confidence",
        label="Store Demand Confidence",
        type="number",
        significance="Lets downstream systems weight uncertain predictions carefully.",
    ),
]


def build_contract_response() -> ContractResponse:
    return ContractResponse(
        endpoint="/predict",
        fallbackEndpoint="/predict",
        supportedSources=[
            "historical_velocity",
            "ml_forecast",
            "external_ml_service",
        ],
        defaultModelName="external-demand-forecast-v1",
        defaultHorizonDays=30,
        defaultHistoryWindowDays=180,
        featureDefinitions=EXAMPLE_FEATURE_DEFINITIONS,
    )
