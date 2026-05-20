import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";
import { connectDb } from "../src/config/db.js";
import User from "../src/models/User.js";
import Habit from "../src/models/Habit.js";
import HabitLog from "../src/models/HabitLog.js";
import { getDayKey, getWeekKey, awardXpForCompletion, calculateNextStreak, levelFromXp } from "../src/utils/gamification.js";

dotenv.config();

async function seed() {
  await connectDb();
  await Promise.all([User.deleteMany({}), Habit.deleteMany({}), HabitLog.deleteMany({})]);

  const passwordHash = await bcrypt.hash("HabitForge123!", 10);
  const user = await User.create({
    name: "Demo User",
    email: "demo@habitforge.app",
    passwordHash,
    timezone: "America/New_York",
    avatarSeed: "demo-forge",
    isPremium: true
  });

  const habits = await Habit.insertMany([
    { userId: user._id, title: "Drink Water", description: "Eight glasses a day.", frequency: "daily", color: "#1DB954", icon: "droplets", xpPerCheck: 20 },
    { userId: user._id, title: "Read 30 mins", description: "Books over scrolling.", frequency: "daily", color: "#22C55E", icon: "book-open", xpPerCheck: 25 },
    { userId: user._id, title: "Workout Session", description: "Three focused sessions a week.", frequency: "weekly", color: "#84CC16", icon: "dumbbell", xpPerCheck: 40 }
  ]);

  const now = new Date();
  const demoLogs = [];

  for (let habitIndex = 0; habitIndex < habits.length; habitIndex++) {
    const habit = habits[habitIndex];
    let streak = 0;
    let lastCompletedAt = null;
    let xpTotal = 0;

    for (let dayOffset = 89; dayOffset >= 0; dayOffset -= 1) {
      const date = addDays(subDays(now, 89), 89 - dayOffset);
      const shouldComplete = habit.frequency === "daily"
        ? dayOffset % (habitIndex + 4) !== 1
        : dayOffset % 7 === 0 || dayOffset % 14 === 3;

      if (!shouldComplete) {
        continue;
      }

      const completionKey = habit.frequency === "weekly" ? getWeekKey(date, user.timezone) : getDayKey(date, user.timezone);
      const workingHabit = {
        frequency: habit.frequency,
        lastCompletedAt,
        streak,
        userTimezone: user.timezone
      };

      const streakState = calculateNextStreak(workingHabit, date);
      streak = streakState.streak;
      lastCompletedAt = date;

      const xpAwarded = awardXpForCompletion(habit, streak);

      demoLogs.push({
        userId: user._id,
        habitId: habit._id,
        completedAt: date,
        completionKey,
        timezone: user.timezone,
        xpAwarded
      });
    }

    habit.streak = streak;
    habit.bestStreak = Math.max(streak, habit.bestStreak || 0);
    habit.completedCount = demoLogs.filter((log) => log.habitId.toString() === habit._id.toString()).length;
    habit.lastCompletedAt = lastCompletedAt;
    await habit.save();
  }

  console.log(`Preparing to insert ${demoLogs.length} habit logs...`);

  // Deduplicate by habitId + completionKey to avoid unique index collisions
  const uniqueMap = new Map();
  for (const log of demoLogs) {
    const key = `${log.habitId.toString()}|${log.completionKey}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, log);
  }

  const uniqueLogs = Array.from(uniqueMap.values());
  if (uniqueLogs.length !== demoLogs.length) {
    console.log(`Deduplicated demo logs: ${demoLogs.length} -> ${uniqueLogs.length}`);
  }

  try {
    await HabitLog.insertMany(uniqueLogs);
  } catch (e) {
    console.error("HabitLog.insertMany failed:", e && (e.stack || e.message || e));
    console.error("Sample failing demoLogs (first 10):", uniqueLogs.slice(0, 10));
    throw e;
  }
  const xp = demoLogs.reduce((sum, log) => sum + log.xpAwarded, 0);

  user.xp = xp;
  user.level = levelFromXp(xp);
  user.badgeKeys = ["consistency-7", "xp-500", "collector-50", "level-5"];
  await user.save();

  console.log("Seed complete for demo user demo@habitforge.app / HabitForge123!");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
