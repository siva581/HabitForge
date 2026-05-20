function getIsoWeekKey(date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}

export function isHabitCompleteForCurrentPeriod(habit, now = new Date()) {
  if (!habit?.lastCompletedAt) {
    return false;
  }

  const completedAt = new Date(habit.lastCompletedAt);
  if (Number.isNaN(completedAt.getTime())) {
    return false;
  }

  if (habit.frequency === "weekly") {
    return getIsoWeekKey(completedAt) === getIsoWeekKey(now);
  }

  return completedAt.toDateString() === now.toDateString();
}