import { Router } from "express";
import { authRequired, premiumRequired } from "../middleware/auth.js";
import HabitLog from "../models/HabitLog.js";
import { build30DaySeries, buildHeatmap, summarizeWindow } from "../utils/analytics.js";

const router = Router();

router.get("/", authRequired, premiumRequired, async (req, res) => {
  const logs = await HabitLog.find({ userId: req.user._id }).sort({ completedAt: -1 }).lean();
  const timezone = req.user.timezone || "UTC";

  return res.json({
    lineSeries: build30DaySeries(logs, timezone),
    heatmap: buildHeatmap(logs, timezone),
    weekSummary: summarizeWindow(logs, timezone)
  });
});

export default router;
