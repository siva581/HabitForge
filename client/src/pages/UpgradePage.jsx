import { useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export function UpgradePage() {
  const { user, refreshSummary } = useAuth();
  const [busy, setBusy] = useState(false);
  const endpoint = user?.isPremium ? "/premium/deactivate" : "/premium/activate";

  async function togglePremium() {
    setBusy(true);
    try {
      await api.post(endpoint, {});
      await refreshSummary();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-card premium-card">
      <p className="eyebrow">Freemium model</p>
      <h2>{user?.isPremium ? "Pro is active" : "Unlock the heavier tools"}</h2>
      <p>
        Premium unlocks the contribution heatmap, CSV export, and unlimited habits. The free tier still keeps the core loop open.
      </p>

      <div className="premium-list">
        <div>Advanced analytics</div>
        <div>CSV export</div>
        <div>Unlimited habits</div>
      </div>

      <button className="primary-button" disabled={busy} onClick={togglePremium} type="button">
        {busy ? "Updating..." : user?.isPremium ? "Switch back to free" : "Upgrade to Pro"}
      </button>
    </section>
  );
}
