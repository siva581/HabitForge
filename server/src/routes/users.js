import { Router } from "express";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.use(authRequired);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/search", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (query.length < 2) {
    return res.json({ users: [] });
  }

  const currentUser = await User.findById(req.user._id).select("friendIds");
  const friendIds = new Set((currentUser?.friendIds || []).map((id) => id.toString()));
  const regex = new RegExp(escapeRegex(query), "i");

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ name: regex }, { email: regex }]
  })
    .sort({ name: 1 })
    .limit(12)
    .lean();

  return res.json({
    users: users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      avatarSeed: user.avatarSeed,
      level: user.level,
      xp: user.xp,
      isPremium: user.isPremium,
      isFriend: friendIds.has(user._id.toString())
    }))
  });
});

export default router;