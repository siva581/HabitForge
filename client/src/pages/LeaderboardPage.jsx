import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "../components/Avatar.jsx";
import { api } from "../api/client.js";

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("global");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const endpoint = viewMode === "friends" ? "/leaderboard/friends" : "/leaderboard/weekly";
        const response = await api.get(endpoint);
        setLeaders(response.leaders || []);
        setError("");
      } catch (leaderboardError) {
        setError(leaderboardError.message);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [viewMode]);

  return (
    <div className="leaderboard-view">
      <section className="panel-card leaderboard-header">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Social accountability</p>
            <h2>{viewMode === "global" ? "Weekly leaderboard" : "Friends leaderboard"}</h2>
          </div>
        </div>
        <div className="view-toggle">
          <button className={`tab-button ${viewMode === "global" ? "active" : ""}`} onClick={() => setViewMode("global")}>
            🌍 Global
          </button>
          <button className={`tab-button ${viewMode === "friends" ? "active" : ""}`} onClick={() => setViewMode("friends")}>
            👥 Friends
          </button>
        </div>
      </section>

      <motion.section className="panel-card leaderboard-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {error && <p className="form-error">{error}</p>}
        {loading && <p>Loading leaderboard...</p>}
        {!loading && leaders.length === 0 && !error && <p className="section-description">{viewMode === "friends" ? "Add friends to see their scores!" : "No leaderboard data available"}</p>}
        
        {leaders.length > 0 && (
          <div className="leaderboard-list">
            {leaders.map((leader, idx) => (
              <motion.article 
                key={leader.userId} 
                className="leader-row" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: idx * 0.05 }}
              >
                <div className="rank-badge">
                  {idx === 0 && <span className="rank-icon">🥇</span>}
                  {idx === 1 && <span className="rank-icon">🥈</span>}
                  {idx === 2 && <span className="rank-icon">🥉</span>}
                  {idx > 2 && <span className="rank-number">#{idx + 1}</span>}
                </div>
                
                <Avatar seed={leader.avatarSeed} size={40} />
                
                <div className="leader-info">
                  <p className="leader-name">{leader.name}</p>
                  <span className="leader-meta">{leader.completions} completions</span>
                </div>
                
                <div className="leader-xp">
                  <span className="xp-value">{leader.weeklyXp} XP</span>
                  {leader.isPremium && <span className="premium-badge">★</span>}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
