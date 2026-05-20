import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { Avatar } from "../components/Avatar.jsx";
import { AvatarPickerModal } from "../components/AvatarPickerModal.jsx";
import { isHabitCompleteForCurrentPeriod } from "../utils/habitPeriod.js";
import { api } from "../api/client.js";

const badgeCatalog = [
  { key: "first-spark", name: "First Spark", condition: "Complete your first habit check-in", icon: "⚡", tier: "common", target: 1 },
  { key: "apprentice", name: "Apprentice", condition: "Reach Level 5", icon: "🗝️", tier: "common", target: 5 },
  { key: "habit-hoarder", name: "Habit Hoarder", condition: "Create 5 habits", icon: "📊", tier: "rare", target: 5 },
  { key: "week-warrior", name: "Week Warrior", condition: "Reach a 7-day streak", icon: "🔥", tier: "rare", target: 7 },
  { key: "journeyman", name: "Journeyman", condition: "Reach Level 10", icon: "🧭", tier: "rare", target: 10 },
  { key: "fortnight-forge", name: "Fortnight Forge", condition: "Reach a 14-day streak", icon: "⚒️", tier: "epic", target: 14 },
  { key: "grandmaster", name: "Grandmaster", condition: "Reach Level 25", icon: "👑", tier: "epic", target: 25 },
  { key: "month-master", name: "Month Master", condition: "Reach a 30-day streak", icon: "🗓️", tier: "epic", target: 30 },
  { key: "dedicated", name: "Dedicated", condition: "Log 50 completions", icon: "💪", tier: "legendary", target: 50 },
  { key: "century-soul", name: "Century Soul", condition: "Reach a 100-day streak", icon: "🌟", tier: "legendary", target: 100 }
];

function Badge({ badge }) {
  return <span className="badge-pill">{badge.title}</span>;
}

export function DashboardPage() {
  const { announceReward, summary, refreshSummary, user, loadSession } = useAuth();
  const [ready, setReady] = useState(false);
  const [busyHabitId, setBusyHabitId] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    refreshSummary().finally(() => setReady(true));
  }, []);

  if (!summary && !ready) {
    return <div className="panel-card">Loading dashboard...</div>;
  }

  const progressPercent = Math.round((user?.xpProgress || 0) * 100);
  const habits = (summary?.habits || []).map((habit) => ({
    ...habit,
    completedToday: isHabitCompleteForCurrentPeriod(habit)
  }));
  const todayHabits = habits.slice(0, 6);
  const maxStreak = Math.max(0, ...habits.map((habit) => habit.streak || 0));
  const totalCompletions = habits.reduce((sum, habit) => sum + (habit.completedCount || 0), 0);
  const totalHabits = habits.length;
  const level = user?.level || 1;
  const unlockedBadgeKeys = new Set((user?.badges || []).map((badge) => badge.key));
  const badgeProgress = useMemo(
    () => ({
      "first-spark": totalCompletions,
      apprentice: level,
      "habit-hoarder": totalHabits,
      "week-warrior": maxStreak,
      journeyman: level,
      "fortnight-forge": maxStreak,
      grandmaster: level,
      "month-master": maxStreak,
      dedicated: totalCompletions,
      "century-soul": maxStreak
    }),
    [level, maxStreak, totalCompletions, totalHabits]
  );

  async function checkInHabit(habit) {
    setBusyHabitId(habit._id);
    try {
      const response = await api.post(`/habits/${habit._id}/check-in`, {});

      await refreshSummary();
      announceReward({
        icon: "⚡",
        title: `${habit.title} cleared`,
        message: `${response.xpAwarded} XP added to your run`
      });
    } finally {
      setBusyHabitId(null);
    }
  }

  async function handleAvatarChange(newSeed) {
    try {
      await api.put("/auth/profile", { avatarSeed: newSeed });
      await loadSession();
      setShowAvatarPicker(false);
      announceReward({
        icon: "✨",
        title: "Avatar Updated",
        message: "Your new look looks amazing!"
      });
    } catch (err) {
      announceReward({
        icon: "⚠️",
        title: "Error",
        message: "Failed to update avatar"
      });
    }
  }

  return (
    <div className="dashboard-grid">
      {/* PROFILE SECTION */}
      <section className="profile-section panel-card">
        <div className="profile-header">
          <button 
            className="profile-avatar-container avatar-clickable"
            onClick={() => setShowAvatarPicker(true)}
            title="Click to change avatar"
          >
            <Avatar seed={user?.avatarSeed || "forge"} size={80} />
            <span className="avatar-edit-badge">✎</span>
          </button>
          <div>
            <p className="eyebrow">Hero</p>
            <h2>{user?.name || "HabitForge"}</h2>
            <p className="profile-meta">XP {user?.xp || 0} / 80</p>
          </div>
          <div className="profile-level">
            <p className="eyebrow">Level</p>
            <span className="level-badge">{user?.level || 1}</span>
          </div>
        </div>
        <div className="xp-progress-full">
          <div className="xp-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="profile-badges">
          <p className="eyebrow">{(user?.badges || []).length} badges</p>
          <div className="badge-row">
            {(user?.badges || []).slice(0, 3).map((badge) => <Badge key={badge.key} badge={badge} />)}
          </div>
        </div>
      </section>

      {/* TODAY'S QUESTS SECTION */}
      <section className="quests-section">
        <div className="section-header">
          <div>
            <h3>Today's Quests</h3>
            <p className="section-meta">
              {todayHabits.filter((habit) => habit.completedToday).length} of {todayHabits.length} forged today
            </p>
          </div>
          <Link to="/dashboard/habits" className="btn-add-habit">+ New habit</Link>
        </div>
        <div className="quests-grid">
          {todayHabits.map((habit) => (
            <motion.article
              className="quest-card"
              key={habit._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ borderColor: habit.color }}
            >
              <div className="quest-header">
                <div className="quest-icon" style={{ backgroundColor: habit.color }}>
                  {habit.icon || '⚡'}
                </div>
                <div className="quest-title">
                  <h4>{habit.title}</h4>
                  <p>{habit.description || 'Stay consistent'}</p>
                </div>
              </div>
              <div className="quest-meta">
                <span className="streak-info">🔥 {habit.streak || 0} day streak</span>
                <span className="xp-info">+{habit.xpPerCheck} XP</span>
              </div>
              <button className="quest-check" data-completed={habit.completedToday} onClick={() => checkInHabit(habit)} disabled={busyHabitId === habit._id}>
                {habit.completedToday ? "✓" : "○"}
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      {/* STATS GRID */}
      <section className="stats-section">
        <div className="stats-grid">
          <StatCard label="Level" value={user?.level || 1} hint={`${user?.xp || 0} XP earned`} />
          <StatCard label="Streaks active" value={summary?.totals?.streaksActive || 0} hint="Habits still burning" />
          <StatCard label="Total habits" value={summary?.totals?.habits || 0} hint={user?.isPremium ? "Unlimited tier active" : "Free tier cap: 5"} accent="#06b6d4" />
          <StatCard label="Completion log" value={summary?.totals?.completions || 0} hint="Recent check-ins" accent="#0ea5e9" />
        </div>
      </section>

      {/* LEADERBOARD SECTION */}
      <section className="panel-card leaderboard-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Weekly leaderboard</p>
            <h3>Compete for weekly XP</h3>
          </div>
        </div>
        <p className="section-description">Climb the weekly XP rankings by staying consistent with your habits.</p>
      </section>

      {/* ACHIEVEMENTS SECTION */}
      <section className="panel-card achievements-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Achievements</p>
            <h3>Unlock badges</h3>
          </div>
          <span className="achievement-count">{unlockedBadgeKeys.size} / {badgeCatalog.length}</span>
        </div>
        <div className="achievements-grid">
          {badgeCatalog.map((badge) => {
            const progress = badgeProgress[badge.key] || 0;
            const isUnlocked = unlockedBadgeKeys.has(badge.key) || progress >= badge.target;
            const progressValue = Math.min(progress, badge.target);
            const progressPercent = Math.round((progressValue / badge.target) * 100);

            return (
              <motion.div
                key={badge.key}
                className="achievement-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="achievement-head">
                  <span className={`badge-tier ${badge.tier}`}>{badge.tier}</span>
                </div>
                <div className={`achievement-badge ${isUnlocked ? "unlocked" : "locked"} ${badge.tier}`}>
                  {badge.icon}
                </div>
                <h4 className="badge-name">{badge.name}</h4>
                <p className="badge-condition">{badge.condition}</p>
                {!isUnlocked && (
                  <div className="badge-progress">
                    <div className="badge-progress-track">
                      <div className="badge-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="badge-progress-label">
                      {progressValue} / {badge.target}
                    </span>
                  </div>
                )}
                <span className={`badge-status ${isUnlocked ? "unlocked" : "locked"}`}>
                  {isUnlocked ? "✓ Unlocked" : "🔒 Locked"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="panel-card recent-activity">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent log</p>
            <h3>Latest completions</h3>
          </div>
          <span className="log-count">{(summary?.recentLogs || []).length} total</span>
        </div>
        <div className="activity-list">
          {(summary?.recentLogs || []).slice(0, 6).map((log) => (
            <motion.article className="activity-row" key={log._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <strong>{log.xpAwarded} XP</strong>
              <span>{new Date(log.completedAt).toLocaleDateString()}</span>
            </motion.article>
          ))}
        </div>
      </section>

      {/* AVATAR PICKER MODAL */}
      {showAvatarPicker && (
        <AvatarPickerModal
          currentSeed={user?.avatarSeed || "forge"}
          onConfirm={handleAvatarChange}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
}
