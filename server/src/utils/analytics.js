import { formatInTimeZone } from "date-fns-tz";
import { getDayKey } from "./gamification.js";

function buildDateRange(days, timezone) {
  const range = [];
  const end = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(end);
    date.setDate(date.getDate() - offset);
    range.push({ date, key: getDayKey(date, timezone) });
  }

  return range;
}

function tallyLogsByDay(logs, timezone) {
  const counts = new Map();

  logs.forEach((log) => {
    const key = getDayKey(log.completedAt, timezone);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return counts;
}

export function build30DaySeries(logs, timezone = "UTC") {
  const days = buildDateRange(30, timezone);
  const logKeys = tallyLogsByDay(logs, timezone);

  return {
    labels: days.map((item) => formatInTimeZone(item.date, timezone, "MMM d")),
    values: days.map((item) => logKeys.get(item.key) || 0)
  };
}

export function buildHeatmap(logs, timezone = "UTC") {
  const days = buildDateRange(365, timezone);
  const dayCounts = tallyLogsByDay(logs, timezone);

  return days.map((item) => ({
    date: item.key,
    label: formatInTimeZone(item.date, timezone, "EEE"),
    count: dayCounts.get(item.key) || 0,
    level: Math.min(4, dayCounts.get(item.key) || 0)
  }));
}

export function summarizeWindow(logs, timezone = "UTC") {
  const range = buildDateRange(7, timezone);
  const logKeys = new Set(logs.map((log) => getDayKey(log.completedAt, timezone)));

  return range.map((item) => ({
    date: item.key,
    label: formatInTimeZone(item.date, timezone, "EEE"),
    completed: logKeys.has(item.key)
  }));
}
