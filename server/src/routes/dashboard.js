import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import { badgeDetails, evaluateBadges, normalizeHabitStreaks, xpProgress } from "../utils/gamification.js";

const router = Router();

router.get("/summary", authRequired, async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id, archived: false }).sort({ createdAt: -1 });
  const timezone = req.user.timezone || "UTC";
  const changed = normalizeHabitStreaks(habits, timezone);

  if (changed) {
    await Promise.all(habits.filter((habit) => habit.isModified("streak")).map((habit) => habit.save()));
  }

  const habitObjects = habits.map((habit) => habit.toObject());
  const logs = await HabitLog.find({ userId: req.user._id }).sort({ completedAt: -1 }).limit(20).lean();
  const evaluatedBadgeKeys = evaluateBadges(req.user, habitObjects);

  if (JSON.stringify(evaluatedBadgeKeys) !== JSON.stringify(req.user.badgeKeys || [])) {
    req.user.badgeKeys = evaluatedBadgeKeys;
    await req.user.save();
  }

  const xpState = xpProgress(req.user.xp || 0);

  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      timezone: req.user.timezone,
      level: xpState.level,
      xp: req.user.xp || 0,
      xpProgress: xpState.progress,
      isPremium: req.user.isPremium,
      badges: badgeDetails(evaluatedBadgeKeys)
    },
    habits: habitObjects,
    recentLogs: logs,
    totals: {
      habits: habitObjects.length,
      streaksActive: habitObjects.filter((habit) => (habit.streak || 0) > 0).length,
      completions: logs.length
    }
  });
});

export default router;
