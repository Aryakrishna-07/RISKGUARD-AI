// ============================================================
// Flip this ONE flag to switch between mock data (Day 1, no
// backend needed) and your real FastAPI backend (Day 2 onward).
// ============================================================
export const USE_MOCK = true; // <-- change to false once your backend is running

const API_BASE = "http://localhost:8000";

// Shape matches EXACTLY what backend/main.py returns from /score-order,
// so switching USE_MOCK to false requires zero changes to your components.
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
    // simulate network delay so your loading states are testable too
    await new Promise((r) => setTimeout(r, 500));
    return MOCK_RESPONSE;
  }

  const res = await fetch(`${API_BASE}/score-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderInput),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json();
}