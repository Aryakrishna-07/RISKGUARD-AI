"""
RiskGuard AI — backend

Run with:
    uvicorn main:app --reload --port 8000

Endpoints:
    POST /score-order
    GET  /dashboard-metrics
    GET  /model-performance
    GET  /recent-activity
    GET  /health
"""

from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="RiskGuard AI Backend",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# RISK CONFIGURATION
# ============================================================

THRESHOLD = 0.50

# Baseline category order value
CATEGORY_AVG_ORDER_VALUE = 6500.0


# Payment method risk contribution
PAYMENT_RISK = {
    "credit_card": 0.02,
    "debit_card": 0.02,
    "upi": 0.04,
    "bnpl": 0.16,
    "cod": 0.12,
}


# ============================================================
# IN-MEMORY ORDER STORAGE
# ============================================================

scored_orders: list[dict] = []


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class OrderInput(BaseModel):
    orderId: str = Field(
        ...,
        description="Example: ORD-20240892"
    )

    customerId: str = Field(
        ...,
        description="Example: CUST-10042"
    )

    value: float = Field(
        ...,
        ge=0,
        description="Order value in INR"
    )

    payment: Literal[
        "credit_card",
        "debit_card",
        "upi",
        "bnpl",
        "cod"
    ] = "credit_card"

    customerOrderCount: Optional[int] = Field(
        default=0,
        ge=0,
        description="Number of previous orders placed by the customer"
    )


class ScoreResponse(BaseModel):
    risk_score: float
    flagged_high_risk: bool
    threshold_used: float
    mode: str
    top_reasons: list[str]


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def clamp(value: float, minimum: float = 0.01, maximum: float = 0.99) -> float:
    """
    Keep a risk score inside a safe 0–1 range.
    """
    return max(minimum, min(value, maximum))


def get_risk_level(risk_score: float) -> str:
    """
    Convert numerical risk score into a risk category.
    """

    if risk_score >= 0.70:
        return "high"

    if risk_score >= 0.40:
        return "medium"

    return "low"


# ============================================================
# RISK SCORING ENGINE
# ============================================================

def score_order(order: OrderInput) -> ScoreResponse:

    reasons: list[str] = []

    # --------------------------------------------------------
    # START WITH A LOW BASELINE
    # --------------------------------------------------------

    risk_score = 0.08


    # --------------------------------------------------------
    # 1. ORDER VALUE RISK
    # --------------------------------------------------------

    value_ratio = (
        order.value / CATEGORY_AVG_ORDER_VALUE
        if CATEGORY_AVG_ORDER_VALUE > 0
        else 0
    )

    if value_ratio <= 1.0:

        # At or below category average
        value_risk = 0.00

    elif value_ratio <= 1.5:

        # Slightly above average
        value_risk = 0.05

    elif value_ratio <= 2.5:

        # Moderately high
        value_risk = 0.12

        reasons.append(
            f"Order value is above category average "
            f"(₹{order.value:,.0f} vs. ₹{CATEGORY_AVG_ORDER_VALUE:,.0f})"
        )

    elif value_ratio <= 4.0:

        # Significantly high
        value_risk = 0.25

        reasons.append(
            f"Order value is significantly above category average "
            f"(₹{order.value:,.0f} vs. ₹{CATEGORY_AVG_ORDER_VALUE:,.0f})"
        )

    else:

        # Extremely high
        value_risk = 0.40

        reasons.append(
            f"Order price (₹{order.value:,.0f}) is unusually high "
            f"vs. category average (₹{CATEGORY_AVG_ORDER_VALUE:,.0f})"
        )

    risk_score += value_risk


    # --------------------------------------------------------
    # 2. CUSTOMER HISTORY RISK
    # --------------------------------------------------------

    customer_orders = order.customerOrderCount or 0

    if customer_orders == 0:

        # First-time customer
        customer_risk = 0.18

        reasons.append(
            "First-time customer, no order history"
        )

    elif customer_orders == 1:

        customer_risk = 0.10

        reasons.append(
            "Customer has only one previous order"
        )

    elif customer_orders <= 3:

        customer_risk = 0.05

    elif customer_orders <= 10:

        customer_risk = 0.00

    else:

        # Established customer slightly reduces risk
        customer_risk = -0.04

    risk_score += customer_risk


    # --------------------------------------------------------
    # 3. PAYMENT METHOD RISK
    # --------------------------------------------------------

    payment_risk = PAYMENT_RISK.get(
        order.payment,
        0.04
    )

    risk_score += payment_risk

    if order.payment == "bnpl":

        reasons.append(
            "Buy Now Pay Later payment method selected"
        )

    elif order.payment == "cod":

        reasons.append(
            "Cash on Delivery payment method selected"
        )


    # --------------------------------------------------------
    # 4. EXTREME VALUE + NEW CUSTOMER COMBINATION
    # --------------------------------------------------------

    if value_ratio > 4 and customer_orders == 0:

        risk_score += 0.15

        reasons.append(
            "Very high-value order from a first-time customer"
        )


    # --------------------------------------------------------
    # 5. HIGH VALUE + RISKY PAYMENT COMBINATION
    # --------------------------------------------------------

    if value_ratio > 3 and order.payment in ("bnpl", "cod"):

        risk_score += 0.08

        reasons.append(
            "High-value order combined with a higher-risk payment method"
        )


    # --------------------------------------------------------
    # 6. FINAL SCORE
    # --------------------------------------------------------

    risk_score = clamp(risk_score)

    risk_score = round(risk_score, 4)

    flagged_high_risk = risk_score >= THRESHOLD


    # --------------------------------------------------------
    # 7. DEFAULT REASON
    # --------------------------------------------------------

    if not reasons:

        reasons.append(
            "No significant risk factors detected"
        )


    # --------------------------------------------------------
    # 8. RETURN RESPONSE
    # --------------------------------------------------------

    return ScoreResponse(
        risk_score=risk_score,
        flagged_high_risk=flagged_high_risk,
        threshold_used=THRESHOLD,
        mode="live",
        top_reasons=reasons[:4],
    )


# ============================================================
# ACTIVITY DESCRIPTION
# ============================================================

def describe_result(result: ScoreResponse) -> str:

    if result.flagged_high_risk:

        return (
            f"High-risk order detected — "
            f"{result.top_reasons[0].lower()}"
        )

    level = get_risk_level(result.risk_score)

    if level == "medium":

        return "Medium-risk — review recommended"

    return "Low-risk order cleared"


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# ============================================================
# SCORE ORDER
# ============================================================

@app.post(
    "/score-order",
    response_model=ScoreResponse
)
def post_score_order(order: OrderInput):

    result = score_order(order)

    scored_orders.append(
        {
            "id": order.orderId,

            "desc": describe_result(result),

            "score": round(
                result.risk_score * 100
            ),

            "level": get_risk_level(
                result.risk_score
            ),

            "scored_at": datetime.now(
                timezone.utc
            ).isoformat(),
        }
    )

    # Keep only the latest 500 orders
    del scored_orders[:-500]

    return result


# ============================================================
# RECENT ACTIVITY
# ============================================================

@app.get("/recent-activity")
def get_recent_activity(limit: int = 10):

    return list(
        reversed(
            scored_orders[-limit:]
        )
    )


# ============================================================
# DASHBOARD METRICS
# ============================================================

@app.get("/dashboard-metrics")
def get_dashboard_metrics():

    total = len(scored_orders)

    high_risk = sum(
        1
        for order in scored_orders
        if order["level"] == "high"
    )

    average_score = (
        round(
            sum(
                order["score"]
                for order in scored_orders
            ) / total,
            1
        )
        if total
        else 0.0
    )

    return {
        "metrics": [
            {
                "label": "Orders Analyzed",
                "value": total
            },
            {
                "label": "High Risk",
                "value": high_risk
            },
            {
                "label": "Avg Risk Score",
                "value": average_score
            },
        ],

        "recent_activity": list(
            reversed(
                scored_orders[-10:]
            )
        ),
    }


# ============================================================
# MODEL PERFORMANCE
# ============================================================

@app.get("/model-performance")
def get_model_performance():

    # Demo evaluation metrics.
    # Replace with calculated values when a trained model
    # and evaluation dataset are connected.

    return {
        "precision": 0.874,
        "recall": 0.812,
        "accuracy": 0.896,
        "roc_auc": 0.91,
        "true_positives": 1124,
        "false_positives": 163,
        "f1_score": 0.842,
    }