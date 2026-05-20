import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { isHabitCompleteForCurrentPeriod } from "../utils/habitPeriod.js";

const emptyForm = { title: "", description: "", frequency: "", color: "#0891b2", icon: "bolt", xpPerCheck: 20 };
const questFilters = [
  { key: "all", label: "All quests" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "ready", label: "Ready to check in" }
];

const questFilterPredicates = {
  daily: (habit) => habit.frequency === "daily",
  weekly: (habit) => habit.frequency === "weekly",
  ready: (habit) => !habit.completedToday
};

export function HabitsPage() {
  const { announceReward, refreshSummary, reward, summary, user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [busyHabitId, setBusyHabitId] = useState(null);
  const habits = (summary?.habits || []).map((habit) => ({
    ...habit,
    completedToday: isHabitCompleteForCurrentPeriod(habit)
  }));
  const currentBadgeKeys = useMemo(
    () => new Set((summary?.user?.badges || []).map((badge) => badge.key)),
    [summary?.user?.badges]
  );
  const visibleHabits = useMemo(() => {
    const matchesFilter = questFilterPredicates[activeFilter];
    return matchesFilter ? habits.filter(matchesFilter) : habits;
  }, [activeFilter, habits]);

  const questCounts = useMemo(
    () => ({
      total: habits.length,
      daily: habits.filter(questFilterPredicates.daily).length,
      weekly: habits.filter(questFilterPredicates.weekly).length,
      ready: habits.filter(questFilterPredicates.ready).length
    }),
    [habits]
  );

  async function createHabit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/habits", form);
      setForm(emptyForm);
      await refreshSummary();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  }

  async function checkIn(habit) {
    setError("");
    setBusyHabitId(habit._id);
    try {
      const response = await api.post(`/habits/${habit._id}/check-in`, {});
      await refreshSummary();

      const nextBadgeCount = response.user?.badgeKeys?.length || 0;
      const badgeGain = Math.max(0, nextBadgeCount - currentBadgeKeys.size);
      const leveledUp = (response.user?.level || user?.level || 1) > (user?.level || 1);

      announceReward({
        icon: "🎉",
        title: `${habit.title} completed`,
        message: `${response.xpAwarded} XP earned${badgeGain ? ` · ${badgeGain} new badge${badgeGain === 1 ? "" : "s"}` : ""}${leveledUp ? " · level up" : ""}`
      });
    } catch (checkInError) {
      setError(checkInError.message);
    } finally {
      setBusyHabitId(null);
    }
  }

  async function deleteHabit(habit) {
    const confirmed = window.confirm(`Delete ${habit.title}? This will archive the habit.`);
    if (!confirmed) {
      return;
    }

    setError("");
    setBusyHabitId(habit._id);
    try {
      await api.del(`/habits/${habit._id}`);
      await refreshSummary();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusyHabitId(null);
    }
  }

  return (
    <div className="stack-gap">
      <section className="panel-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Habit forge</p>
            <h2>Track the work that matters.</h2>
          </div>
          {!user?.isPremium && <span className="plan-pill">Free plan: 5 active habits</span>}
        </div>

        <div className="quest-strip">
          {questFilters.map((filter) => (
            <button
              key={filter.key}
              className={`quest-filter ${activeFilter === filter.key ? "active" : ""}`}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
            >
              <span>{filter.label}</span>
              <strong>{questCounts[filter.key] ?? questCounts.total}</strong>
            </button>
          ))}
        </div>

        <div className="quest-meter-grid">
          <article className="quest-meter-card">
            <span>Quests ready</span>
            <strong>{questCounts.ready}</strong>
          </article>
          <article className="quest-meter-card">
            <span>Daily tracks</span>
            <strong>{questCounts.daily}</strong>
          </article>
          <article className="quest-meter-card">
            <span>Weekly tracks</span>
            <strong>{questCounts.weekly}</strong>
          </article>
        </div>

        <form className="habit-form" onSubmit={createHabit}>
          <input required placeholder="Enter habit title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input placeholder="Add a short note" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <select required value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })}>
            <option value="" disabled>Select frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
          <input type="number" min="1" placeholder="XP per check" value={form.xpPerCheck} onChange={(event) => setForm({ ...form, xpPerCheck: Number(event.target.value) })} />
          <button className="primary-button" disabled={saving} type="submit">{saving ? "Saving..." : "Add habit"}</button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </section>

      <section className="habit-grid">
        {visibleHabits.map((habit, index) => {
          const completed = Boolean(habit.completedToday);
          return (
            <motion.article
              className={`habit-card ${completed ? "completed" : ""}`}
              key={habit._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              style={{ borderColor: habit.color }}
            >
              <div className="habit-topline">
                <div>
                  <p className="eyebrow">{habit.frequency}</p>
                  <h3>{habit.title}</h3>
                </div>
                <span className="streak-pill">{habit.streak || 0} day streak</span>
              </div>
              <p>{habit.description || "No description yet."}</p>
              <div className="habit-meta">
                <span>{habit.xpPerCheck} XP/check</span>
                <span>{habit.completedCount || 0} completions</span>
              </div>
              <button
                className="primary-button accent"
                onClick={() => checkIn(habit)}
                type="button"
                disabled={busyHabitId === habit._id || completed}
              >
                {busyHabitId === habit._id ? "Claiming reward..." : completed ? "Reward claimed" : "Check in"}
              </button>
              <button
                className="ghost-button"
                onClick={() => deleteHabit(habit)}
                type="button"
                disabled={busyHabitId === habit._id}
                style={{ marginTop: 10 }}
              >
                Delete habit
              </button>
            </motion.article>
          );
        })}
      </section>

      <AnimatePresence>
        {reward && (
          <motion.div
            className="quest-celebration"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <p className="eyebrow">Reward unlocked</p>
            <h3>{reward.title}</h3>
            <p>{reward.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
