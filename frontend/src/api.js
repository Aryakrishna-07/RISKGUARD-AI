// ============================================================
// RiskGuard AI — Frontend API
// Connects the React frontend to the FastAPI backend.
// ============================================================

export const USE_MOCK = false;

const API_BASE = "http://localhost:8000";

// ============================================================
// Risk Scoring
// ============================================================

const MOCK_RESPONSE = {
  risk_score: 0.73,
  flagged_high_risk: true,
  threshold_used: 0.5,
  mode: "mock",
  top_reasons: [
    "Order price is unusually high vs. category average",
    "First-time customer, no order history",
  ],
};

export async function scoreOrder(orderInput) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_RESPONSE;
  }

  const res = await fetch(`${API_BASE}/score-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderInput),
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  return res.json();
}

// ============================================================
// Dashboard
// ============================================================

const MOCK_DASHBOARD = {
  metrics: [
    {
      label: "Orders Analyzed",
      value: "12,482",
      change: "+12.4%",
      up: true,
      spark: [60, 72, 65, 80, 78, 92, 88, 95, 100, 98, 110, 124],
      color: "purple",
    },
    {
      label: "High Risk",
      value: "1,284",
      change: "10.3%",
      up: false,
      neutral: true,
      spark: [8, 11, 9, 13, 10, 12, 11, 14, 13, 12, 13, 12],
      color: "red",
    },
    {
      label: "Loss Prevented",
      value: "₹8.42L",
      change: "+18.7%",
      up: true,
      spark: [40, 52, 48, 60, 65, 70, 68, 78, 80, 76, 84, 90],
      color: "green",
    },
    {
      label: "Avg Risk Score",
      value: "34.8",
      change: "-4.2%",
      up: true,
      spark: [38, 36, 37, 35, 36, 34, 35, 33, 35, 34, 35, 34],
      color: "amber",
    },
  ],

  recent_activity: [
    {
      id: "ORD-20240892",
      desc: "High-risk order detected",
      score: 78,
      level: "high",
    },
    {
      id: "ORD-20240891",
      desc: "Medium-risk — new account",
      score: 51,
      level: "medium",
    },
    {
      id: "ORD-20240890",
      desc: "Low-risk order cleared",
      score: 18,
      level: "low",
    },
    {
      id: "ORD-20240889",
      desc: "High-risk — location anomaly",
      score: 83,
      level: "high",
    },
  ],
};

export async function getDashboardMetrics() {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_DASHBOARD;
  }

  const res = await fetch(`${API_BASE}/dashboard-metrics`);

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  return res.json();
}

// ============================================================
// Model Performance
// ============================================================

const MOCK_MODEL_PERFORMANCE = {
  precision: 0.874,
  recall: 0.812,
  accuracy: 0.896,
  roc_auc: 0.91,
  true_positives: 1124,
  false_positives: 163,
  f1_score: 0.842,
};

export async function getModelPerformance() {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_MODEL_PERFORMANCE;
  }

  const res = await fetch(`${API_BASE}/model-performance`);

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  return res.json();
}

// ============================================================
// Health Check
// ============================================================

export async function checkBackendHealth() {
  const res = await fetch(`${API_BASE}/health`);

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }

  return res.json();
}