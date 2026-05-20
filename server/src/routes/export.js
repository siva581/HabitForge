import { Router } from "express";
import { authRequired, premiumRequired } from "../middleware/auth.js";
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

function escapeCsvCell(value) {
  const text = `${value ?? ""}`;

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

const router = Router();

router.get("/csv", authRequired, premiumRequired, async (req, res) => {
  const habits = await Habit.find({ userId: req.user._id }).lean();
  const logs = await HabitLog.find({ userId: req.user._id }).sort({ completedAt: -1 }).lean();
  const rows = [
    ["type", "title", "frequency", "completedAt", "streak", "xpAwarded"].join(",")
  ];

  habits.forEach((habit) => {
    rows.push(["habit", habit.title, habit.frequency, "", habit.streak || 0, ""].map(escapeCsvCell).join(","));
  });

  logs.forEach((log) => {
    const habit = habits.find((item) => item._id.toString() === log.habitId.toString());
    rows.push(["log", habit?.title || "Habit", habit?.frequency || "", log.completedAt.toISOString(), "", log.xpAwarded || 0].map(escapeCsvCell).join(","));
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="habitforge-export.csv"');
  return res.send(rows.join("\n"));
});

export default router;
