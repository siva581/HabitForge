import { Router } from "express";
import { subDays } from "date-fns";
import HabitLog from "../models/HabitLog.js";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function mapLeaders(entries, peopleById) {
  return entries.map((entry, index) => {
    const person = peopleById.get(entry._id.toString());

    return {
      rank: index + 1,
      userId: entry._id,
      name: person?.name || "Unknown",
      avatarSeed: person?.avatarSeed || "forge",
      weeklyXp: entry.weeklyXp,
      completions: entry.completions,
      isPremium: person?.isPremium || false
    };
  });
}

router.get("/weekly", authRequired, async (req, res) => {
  const since = subDays(new Date(), 7);
  const totals = await HabitLog.aggregate([
    { $match: { completedAt: { $gte: since } } },
    { $group: { _id: "$userId", weeklyXp: { $sum: "$xpAwarded" }, completions: { $sum: 1 } } },
    { $sort: { weeklyXp: -1, completions: -1 } },
    { $limit: 10 }
  ]);

  const users = await User.find({ _id: { $in: totals.map((entry) => entry._id) } }).lean();
  const byId = new Map(users.map((user) => [user._id.toString(), user]));

  return res.json({
    leaders: mapLeaders(totals, byId)
  });
});

// Friends leaderboard
router.get("/friends", authRequired, async (req, res) => {
  const user = await User.findById(req.user._id);
  const friendIds = user.friendIds || [];

  if (friendIds.length === 0) {
    return res.json({ leaders: [] });
  }

  const since = subDays(new Date(), 7);
  const totals = await HabitLog.aggregate([
    { $match: { userId: { $in: friendIds }, completedAt: { $gte: since } } },
    { $group: { _id: "$userId", weeklyXp: { $sum: "$xpAwarded" }, completions: { $sum: 1 } } },
    { $sort: { weeklyXp: -1, completions: -1 } }
  ]);

  const friends = await User.find({ _id: { $in: friendIds } }).lean();
  const byId = new Map(friends.map((friend) => [friend._id.toString(), friend]));

  return res.json({
    leaders: mapLeaders(totals, byId)
  });
});

export default router;
