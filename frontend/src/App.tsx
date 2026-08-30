import { useState, useEffect } from "react";
import { scoreOrder, getDashboardMetrics, getModelPerformance, USE_MOCK } from "./api";

// ── Icons ──────────────────────────────────────────────────────────────────
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2Z" fill="url(#shield-grad)" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="shield-grad" x1="3" y1="2" x2="21" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconRisk() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 19h20L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconModel() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ values, color = "purple" }: { values: number[]; color?: "purple" | "green" | "red" | "amber" }) {
  const max = Math.max(...values);
  const colorMap = {
    purple: "linear-gradient(180deg, rgba(139,92,246,0.9), rgba(59,130,246,0.4))",
    green: "linear-gradient(180deg, rgba(74,222,128,0.8), rgba(74,222,128,0.2))",
    red: "linear-gradient(180deg, rgba(248,113,113,0.8), rgba(248,113,113,0.2))",
    amber: "linear-gradient(180deg, rgba(251,191,36,0.8), rgba(251,191,36,0.2))",
  };
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: `${Math.max(15, (v / max) * 100)}%`,
            background: colorMap[color],
            borderRadius: 2,
            opacity: 0.7 + (i / values.length) * 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
type Screen = "risk" | "dashboard" | "model";

function Sidebar({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const items: { id: Screen; label: string; icon: JSX.Element }[] = [
    { id: "risk", label: "Risk Scoring", icon: <IconRisk /> },
    { id: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { id: "model", label: "Model Performance", icon: <IconModel /> },
  ];

  return (
    <div
      style={{
        width: 220,
        minWidth: 220,
        background: "#0E0920",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "24px 16px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(139,92,246,0.4)",
          }}
        >
          <ShieldIcon />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#F4F2FA", lineHeight: 1.2 }}>RiskGuard</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#9B95B0", lineHeight: 1.2 }}>AI</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              transition: "all 0.15s ease",
              ...(active === item.id
                ? {
                    background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(59,130,246,0.22))",
                    border: "1px solid rgba(139,92,246,0.3)",
                    color: "#F4F2FA",
                  }
                : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "#9B95B0",
                  }),
            }}
            className={active === item.id ? "" : "nav-item"}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
      </nav>

      {/* Bottom label */}
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#6B6485", textTransform: "uppercase" }}>
        RISKGUARD AI
      </div>
    </div>
  );
}

// ── Screen 1: Risk Scoring ────────────────────────────────────────────────
function RiskScoring() {
  const [form, setForm] = useState({ orderId: "", customerId: "", value: "", payment: "credit_card" });
  const [scored, setScored] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    risk_score: number;
    flagged_high_risk: boolean;
    top_reasons: string[];
  } | null>(null);

  const score = result ? Math.round(result.risk_score * 100) : 0;
  const reasons = result?.top_reasons ?? [];
  const riskLevel = score >= 50 ? "high" : score >= 25 ? "medium" : "low";

  async function handleScore() {
    if (!form.orderId && !form.value) return;
    setLoading(true);
    setError(null);
    try {
      const res = await scoreOrder({
        orderId: form.orderId,
        customerId: form.customerId,
        value: Number(form.value) || 0,
        payment: form.payment,
      });
      setResult(res);
      setScored(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to score order");
      setScored(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "32px 36px", flex: 1, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#F4F2FA", margin: 0 }}>
          Order Risk Scoring
        </h1>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", padding: "4px 10px",
          background: USE_MOCK ? "rgba(251,191,36,0.12)" : "rgba(74,222,128,0.12)",
          border: USE_MOCK ? "1px solid rgba(251,191,36,0.25)" : "1px solid rgba(74,222,128,0.25)",
          borderRadius: 100, color: USE_MOCK ? "#FBBF24" : "#4ADE80", display: "flex", alignItems: "center", gap: 5
        }}>
          <span style={{ fontSize: 8 }}>●</span> {USE_MOCK ? "MOCK" : "LIVE"}
        </span>
      </div>
      {error && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: 10,
          background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
          color: "#F87171", fontSize: 13,
        }}>
          {error}
        </div>
      )}
      <p style={{ fontSize: 14, color: "#9B95B0", marginBottom: 32, margin: "0 0 32px" }}>
        Evaluate an order and identify potential risk before fulfillment.
      </p>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Order Details */}
        <div className="card" style={{ padding: 28 }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Order Details</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Order ID", key: "orderId", placeholder: "ORD-20240892" },
              { label: "Customer ID", key: "customerId", placeholder: "CUST-10042" },
              { label: "Order Value (₹)", key: "value", placeholder: "42800" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#9B95B0", display: "block", marginBottom: 6 }}>{label}</label>
                <input
                  className="input-field"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#9B95B0", display: "block", marginBottom: 6 }}>Payment Type</label>
              <select
                className="input-field"
                value={form.payment}
                onChange={(e) => setForm({ ...form, payment: e.target.value })}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI</option>
                <option value="bnpl">Buy Now Pay Later</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>

            <button
              onClick={handleScore}
              disabled={loading}
              style={{
                marginTop: 8,
                padding: "12px 20px",
                background: loading ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #8B5CF6, #3B82F6)",
                border: "none",
                borderRadius: 12,
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.15s ease",
                boxShadow: loading ? "none" : "0 4px 20px rgba(139,92,246,0.35)",
              }}
            >
              {loading ? "Analyzing…" : "Score Order"}
            </button>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column" }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Risk Assessment</p>

          {!scored ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 280 }}>
              {/* AI Orb */}
              <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  position: "absolute", inset: -20,
                  background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
                  borderRadius: "50%", filter: "blur(12px)"
                }} />
                <div style={{
                  width: 80, height: 80,
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, position: "relative"
                }}>
                  🛡️
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#6B6485", textAlign: "center" }}>Submit an order to see its risk score.</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Score display */}
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div style={{
                    position: "absolute", inset: -30,
                    background: `radial-gradient(circle, ${riskLevel === "high" ? "rgba(248,113,113,0.2)" : riskLevel === "medium" ? "rgba(251,191,36,0.2)" : "rgba(74,222,128,0.2)"} 0%, transparent 70%)`,
                    borderRadius: "50%", filter: "blur(16px)"
                  }} />
                  <div style={{
                    fontSize: 72, fontWeight: 900, lineHeight: 1, position: "relative",
                    color: riskLevel === "high" ? "#F87171" : riskLevel === "medium" ? "#FBBF24" : "#4ADE80",
                  }}>{score}</div>
                </div>
                <div className="eyebrow" style={{ marginTop: 8, color: "#9B95B0" }}>Risk Score</div>
                <div style={{ marginTop: 12 }}>
                  <span
                    className={riskLevel === "high" ? "risk-badge-high" : riskLevel === "medium" ? "risk-badge-medium" : "risk-badge-low"}
                    style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}
                  >
                    {riskLevel === "high" ? "🔴 HIGH RISK" : riskLevel === "medium" ? "🟡 MEDIUM RISK" : "🟢 LOW RISK"}
                  </span>
                </div>
              </div>

              {/* Why flagged */}
              <div className="card-inner" style={{ padding: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#9B95B0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
                  Why Flagged?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reasons.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, flexShrink: 0,
                        color: riskLevel === "high" ? "#F87171" : riskLevel === "medium" ? "#FBBF24" : "#4ADE80",
                      }}>✓</span>
                      <span style={{ fontSize: 13, color: "#F4F2FA" }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Screen 2: Dashboard ────────────────────────────────────────────────────
type DashboardMetric = {
  label: string;
  value: string | number;
  change?: string;
  up?: boolean;
  neutral?: boolean;
  spark?: number[];
  color?: "purple" | "green" | "red" | "amber";
};

type ActivityRow = { id: string; desc: string; score: number; level: "high" | "medium" | "low" };

function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDashboardMetrics()
      .then((data) => {
        if (cancelled) return;
        setMetrics(data.metrics ?? []);
        setRecentActivity(data.recent_activity ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: "32px 36px", flex: 1, overflowY: "auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#F4F2FA", margin: "0 0 8px" }}>
        Risk Dashboard
      </h1>
      <p style={{ fontSize: 14, color: "#9B95B0", margin: "0 0 32px" }}>
        Monitor order risk and model activity at a glance.
      </p>

      {error && (
        <div style={{
          marginBottom: 20, padding: "10px 14px", borderRadius: 10,
          background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
          color: "#F87171", fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 14, color: "#6B6485" }}>Loading dashboard…</p>
      ) : (
        <>
      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${metrics.length || 1}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: 22 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>{m.label}</p>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#F4F2FA", lineHeight: 1, marginBottom: 6 }}>{m.value}</div>
            {(m.change || m.spark) && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {m.change && (
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: m.neutral ? "#9B95B0" : m.up ? "#4ADE80" : "#F87171"
                  }}>
                    {m.neutral ? "" : m.up ? "▲ " : "▼ "}{m.change}
                  </span>
                )}
                {m.spark && <Sparkline values={m.spark} color={m.color} />}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card" style={{ padding: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 20 }}>Recent Risk Activity</p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {recentActivity.length === 0 && (
            <p style={{ fontSize: 13, color: "#6B6485", padding: "8px 0" }}>No orders scored yet.</p>
          )}
          {recentActivity.map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 0",
              borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: row.level === "high" ? "#F87171" : row.level === "medium" ? "#FBBF24" : "#4ADE80",
                boxShadow: `0 0 8px ${row.level === "high" ? "rgba(248,113,113,0.5)" : row.level === "medium" ? "rgba(251,191,36,0.5)" : "rgba(74,222,128,0.5)"}`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F4F2FA" }}>{row.id}</div>
                <div style={{ fontSize: 12, color: "#9B95B0", marginTop: 1 }}>{row.desc}</div>
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800,
                color: row.level === "high" ? "#F87171" : row.level === "medium" ? "#FBBF24" : "#4ADE80",
              }}>
                {row.score}
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// ── Screen 3: Model Performance ────────────────────────────────────────────
type ModelPerfData = {
  precision: number;
  recall: number;
  accuracy: number;
  roc_auc: number;
  true_positives: number;
  false_positives: number;
  f1_score: number;
};

function ModelPerformance() {
  const [data, setData] = useState<ModelPerfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getModelPerformance()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load model performance"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const metrics = data ? [
    { label: "Precision", value: `${(data.precision * 100).toFixed(1)}%`, raw: data.precision },
    { label: "Recall", value: `${(data.recall * 100).toFixed(1)}%`, raw: data.recall },
    { label: "Accuracy", value: `${(data.accuracy * 100).toFixed(1)}%`, raw: data.accuracy },
    { label: "ROC-AUC", value: data.roc_auc.toFixed(2), raw: data.roc_auc },
  ] : [];

  const bars = data ? [
    { label: "Precision", value: data.precision * 100, display: `${(data.precision * 100).toFixed(1)}%` },
    { label: "Recall", value: data.recall * 100, display: `${(data.recall * 100).toFixed(1)}%` },
    { label: "Accuracy", value: data.accuracy * 100, display: `${(data.accuracy * 100).toFixed(1)}%` },
  ] : [];

  const details = data ? [
    { label: "True Positives", value: data.true_positives.toLocaleString() },
    { label: "False Positives", value: data.false_positives.toLocaleString() },
    { label: "F1 Score", value: data.f1_score.toFixed(3) },
  ] : [];

  return (
    <div style={{ padding: "32px 36px", flex: 1, overflowY: "auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#F4F2FA", margin: "0 0 8px" }}>
        Model Performance
      </h1>
      <p style={{ fontSize: 14, color: "#9B95B0", margin: "0 0 32px" }}>
        Key performance indicators for the RiskGuard AI model.
      </p>

      {error && (
        <div style={{
          marginBottom: 20, padding: "10px 14px", borderRadius: 10,
          background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
          color: "#F87171", fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: 14, color: "#6B6485" }}>Loading model performance…</p>
      ) : (
      <>
      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: 22 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>{m.label}</p>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 12 }}>
              <span className="gradient-text">{m.value}</span>
            </div>
            {/* Mini accuracy ring indicator */}
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${m.raw * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Classification Performance */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <p className="eyebrow" style={{ margin: 0 }}>Classification Performance</p>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          {/* AI orb accent */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -8,
              background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
              borderRadius: "50%", filter: "blur(8px)"
            }} />
            <div style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, position: "relative",
              boxShadow: "0 4px 16px rgba(139,92,246,0.5)",
            }}>
              🤖
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {bars.map((b, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#F4F2FA" }}>{b.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#F4F2FA" }}>{b.display}</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${b.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom details row */}
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {details.map((s, i) => (
            <div key={i} className="card-inner" style={{ padding: "14px 18px" }}>
              <p className="eyebrow" style={{ marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#F4F2FA", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

// ── App Shell ──────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("risk");

  return (
    <div style={{ display: "flex", height: "100%", background: "#120C24", overflow: "hidden" }}>
      <Sidebar active={screen} onNav={setScreen} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {screen === "risk" && <RiskScoring />}
        {screen === "dashboard" && <Dashboard />}
        {screen === "model" && <ModelPerformance />}
      </main>
    </div>
  );
}
