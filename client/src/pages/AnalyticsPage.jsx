import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { LineChart } from "../components/LineChart.jsx";
import { Heatmap } from "../components/Heatmap.jsx";
import { api } from "../api/client.js";

const premiumOnlyMessage = "Analytics are available for Premium members only";

export function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await api.get("/analytics");
        setAnalyticsData(response);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.isPremium) {
      fetchAnalytics();
    } else {
      setLoading(false);
      setError(premiumOnlyMessage);
    }
  }, [user]);

  if (loading) {
    return (
      <section className="panel-card">
        <p>Loading your analytics...</p>
      </section>
    );
  }

  if (error || !analyticsData) {
    return (
      <section className="panel-card">
        <p className="form-error">{error || "Analytics not available"}</p>
      </section>
    );
  }

  return (
    <div className="analytics-grid">
      <motion.section className="panel-card analytics-chart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Last 30 days</p>
            <h3>Consistency trend</h3>
          </div>
          <span className="chart-hint">Daily completions</span>
        </div>
        <div className="chart-container">
          <LineChart labels={analyticsData.lineSeries.labels} values={analyticsData.lineSeries.values} title="Daily Completions" />
        </div>
      </motion.section>

      <motion.section className="panel-card week-summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">This week</p>
            <h3>Weekly overview</h3>
          </div>
        </div>
        <div className="week-grid">
          {analyticsData.weekSummary?.map((day) => (
            <div key={day.date} className="week-day" data-completed={day.completed}>
              <p className="day-label">{day.label}</p>
              <span className="day-icon">{day.completed ? "✓" : "○"}</span>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section className="panel-card heatmap-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">All time</p>
            <h3>Year in review</h3>
          </div>
        </div>
        <Heatmap cells={analyticsData.heatmap} />
      </motion.section>
    </div>
  );
}
