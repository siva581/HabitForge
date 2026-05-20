import { Router } from "express";
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import {
  awardXpForCompletion,
  calculateNextStreak,
  evaluateBadges,
  getCurrentPeriodKey,
  getDayKey,
  getPreviousPeriodKey,
  levelFromXp,
  normalizeExpiredStreak,
  normalizeHabitStreaks,
  xpProgress
} from "../utils/gamification.js";

const router = Router();

function getCompletionKey(habit, date = new Date(), timezone = "UTC") {
  return habit.frequency === "weekly" ? getCurrentPeriodKey(date, timezone, "weekly") : getDayKey(date, timezone);
}

router.use(authRequired);

router.get("/", async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id, archived: false }).sort({ createdAt: -1 });
  const timezone = req.user.timezone || "UTC";
  const changed = normalizeHabitStreaks(habits, timezone);

  if (changed) {
    await Promise.all(habits.filter((habit) => habit.isModified("streak")).map((habit) => habit.save()));
  }

  const recentLogs = await HabitLog.find({ userId: req.user._id }).sort({ completedAt: -1 }).limit(10).lean();

  return res.json({ habits: habits.map((habit) => habit.toObject()), recentLogs });
});

router.post("/", async (req, res) => {
  const { title, description = "", frequency = "daily", color = "#1DB954", icon = "bolt", xpPerCheck = 20 } = req.body;
  const activeCount = await Habit.countDocuments({ userId: req.user._id, archived: false });

  if (!req.user.isPremium && activeCount >= 5) {
    return res.status(403).json({ message: "Free accounts can keep up to 5 active habits" });
  }

  if (!title) {
    return res.status(400).json({ message: "Habit title is required" });
  }

  const habit = await Habit.create({
    userId: req.user._id,
    title,
    description,
    frequency,
    color,
    icon,
    xpPerCheck
  });

  return res.status(201).json({ habit });
});

router.patch("/:habitId", async (req, res) => {
  const habit = await Habit.findOneAndUpdate(
    { _id: req.params.habitId, userId: req.user._id },
    req.body,
    { new: true }
  );

  if (!habit) {
    return res.status(404).json({ message: "Habit not found" });
  }

  return res.json({ habit });
});

router.delete("/:habitId", async (req, res) => {
  const habit = await Habit.findOneAndUpdate(
    { _id: req.params.habitId, userId: req.user._id },
    { archived: true },
    { new: true }
  );

  if (!habit) {
    return res.status(404).json({ message: "Habit not found" });
  }

  return res.json({ habit });
});

router.post("/:habitId/check-in", async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.habitId, userId: req.user._id, archived: false });

  if (!habit) {
    return res.status(404).json({ message: "Habit not found" });
  }

  const userTimezone = req.user.timezone || "UTC";
  const now = new Date();
  const completionKey = getCompletionKey(habit, now, userTimezone);

  habit.userTimezone = userTimezone;
  habit.streak = normalizeExpiredStreak(habit, now);

  const existingLog = await HabitLog.findOne({ habitId: habit._id, completionKey });
  if (existingLog) {
    return res.status(409).json({ message: "This habit is already checked in for the current period" });
  }

  const nextStreak = calculateNextStreak(habit, now);
  const xpAwarded = awardXpForCompletion(habit, nextStreak.streak);

  habit.streak = nextStreak.streak;
  habit.bestStreak = Math.max(habit.bestStreak || 0, nextStreak.streak);
  habit.lastCompletedAt = now;
  habit.completedCount += 1;
  await habit.save();

  const user = await User.findById(req.user._id);
  user.xp = (user.xp || 0) + xpAwarded;
  user.level = levelFromXp(user.xp);
  const allHabits = await Habit.find({ userId: req.user._id, archived: false })
    .select("streak completedCount")
    .lean();
  user.badgeKeys = evaluateBadges(user, allHabits);
  await user.save();

  const log = await HabitLog.create({
    userId: user._id,
    habitId: habit._id,
    completedAt: now,
    completionKey,
    timezone: userTimezone,
    xpAwarded
  });

  return res.json({
    habit,
    log,
    user: {
      xp: user.xp,
      level: user.level,
      badgeKeys: user.badgeKeys,
      xpState: xpProgress(user.xp)
    },
    xpAwarded,
    unlockedBadgeKeys: user.badgeKeys
  });
});

export default router;
