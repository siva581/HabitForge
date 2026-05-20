import { subDays, subWeeks } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const legacyBadgeMap = {
  "consistency-7": "week-warrior",
  "consistency-30": "month-master",
  "xp-500": "journeyman",
  "collector-50": "dedicated",
  "level-5": "apprentice"
};

export const badgeDefinitions = [
  { key: "first-spark", title: "First Spark", description: "Complete your first habit check-in.", icon: "spark" },
  { key: "apprentice", title: "Apprentice", description: "Reach Level 5.", icon: "level" },
  { key: "habit-hoarder", title: "Habit Hoarder", description: "Create 5 habits.", icon: "stack" },
  { key: "week-warrior", title: "Week Warrior", description: "Reach a 7-day streak on any habit.", icon: "flame" },
  { key: "journeyman", title: "Journeyman", description: "Reach Level 10.", icon: "compass" },
  { key: "fortnight-forge", title: "Fortnight Forge", description: "Reach a 14-day streak.", icon: "anvil" },
  { key: "grandmaster", title: "Grandmaster", description: "Reach Level 25.", icon: "crown" },
  { key: "month-master", title: "Month Master", description: "Reach a 30-day streak.", icon: "calendar" },
  { key: "dedicated", title: "Dedicated", description: "Log 50 total completions.", icon: "medal" },
  { key: "century-soul", title: "Century Soul", description: "Reach a 100-day streak.", icon: "star" }
];

function normalizeBadgeKey(key) {
  return legacyBadgeMap[key] || key;
}

function getPeriodKey(date, timezone, frequency) {
  return frequency === "weekly" ? getWeekKey(date, timezone) : getDayKey(date, timezone);
}

export function getDayKey(date, timezone = "UTC") {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function getWeekKey(date, timezone = "UTC") {
  return formatInTimeZone(date, timezone, "RRRR-'W'II");
}

export function getPreviousPeriodKey(date, timezone, frequency) {
  const baseDate = frequency === "weekly" ? subWeeks(date, 1) : subDays(date, 1);
  return getPeriodKey(baseDate, timezone, frequency);
}

export function getCurrentPeriodKey(date, timezone, frequency) {
  return getPeriodKey(date, timezone, frequency);
}

export function calculateNextStreak(habit, now = new Date()) {
  const timezone = habit.userTimezone || "UTC";
  const currentKey = getCurrentPeriodKey(now, timezone, habit.frequency);
  const previousKey = getPreviousPeriodKey(now, timezone, habit.frequency);
  const lastKey = habit.lastCompletedAt ? getCurrentPeriodKey(habit.lastCompletedAt, timezone, habit.frequency) : null;

  if (lastKey === currentKey) {
    return { blocked: true, streak: habit.streak, reason: "already-completed" };
  }

  const nextStreak = lastKey === previousKey ? habit.streak + 1 : 1;

  return {
    blocked: false,
    streak: nextStreak,
    currentKey,
    previousKey,
    lastKey
  };
}

export function normalizeExpiredStreak(habit, now = new Date()) {
  const timezone = habit.userTimezone || "UTC";
  if (!habit.lastCompletedAt) {
    return 0;
  }

  const currentKey = getCurrentPeriodKey(now, timezone, habit.frequency);
  const previousKey = getPreviousPeriodKey(now, timezone, habit.frequency);
  const lastKey = getCurrentPeriodKey(habit.lastCompletedAt, timezone, habit.frequency);

  if (lastKey !== currentKey && lastKey !== previousKey) {
    return 0;
  }

  return habit.streak || 0;
}

export function normalizeHabitStreaks(habits, timezone = "UTC", now = new Date()) {
  let changed = false;

  for (const habit of habits) {
    habit.userTimezone = timezone;
    const normalized = normalizeExpiredStreak(habit, now);

    if ((habit.streak || 0) !== normalized) {
      habit.streak = normalized;
      changed = true;
    }
  }

  return changed;
}

export function levelFromXp(xp) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
}

export function xpForLevel(level) {
  return Math.pow(level - 1, 2) * 100;
}

export function xpProgress(xp) {
  const level = levelFromXp(xp);
  const currentFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  const progress = nextFloor === currentFloor ? 1 : (xp - currentFloor) / (nextFloor - currentFloor);

  return {
    level,
    currentFloor,
    nextFloor,
    progress: Math.min(1, Math.max(0, progress))
  };
}

export function awardXpForCompletion(habit, streak) {
  const streakBonus = Math.min(40, Math.floor(streak / 3) * 5);
  return habit.xpPerCheck + streakBonus;
}

export function evaluateBadges(user, habits = []) {
  const unlocked = new Set((user.badgeKeys || []).map(normalizeBadgeKey));

  const maxStreak = Math.max(0, ...habits.map((habit) => habit.streak || 0));
  const totalCompletions = habits.reduce((sum, habit) => sum + (habit.completedCount || 0), 0);
  const totalHabits = habits.length;
  const level = user.level || 1;

  if (totalCompletions >= 1) unlocked.add("first-spark");
  if (level >= 5) unlocked.add("apprentice");
  if (totalHabits >= 5) unlocked.add("habit-hoarder");
  if (maxStreak >= 7) unlocked.add("week-warrior");
  if (level >= 10) unlocked.add("journeyman");
  if (maxStreak >= 14) unlocked.add("fortnight-forge");
  if (level >= 25) unlocked.add("grandmaster");
  if (maxStreak >= 30) unlocked.add("month-master");
  if (totalCompletions >= 50) unlocked.add("dedicated");
  if (maxStreak >= 100) unlocked.add("century-soul");

  return Array.from(unlocked);
}

export function badgeDetails(keys = []) {
  const normalized = new Set(keys.map(normalizeBadgeKey));
  return badgeDefinitions.filter((badge) => normalized.has(badge.key));
}
