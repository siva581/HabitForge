import { Router } from "express";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

async function setPremiumState(userId, isPremium) {
  const user = await User.findById(userId);
  user.isPremium = isPremium;
  await user.save();
  return { isPremium };
}

router.post("/activate", authRequired, async (req, res) => {
  const payload = await setPremiumState(req.user._id, true);
  return res.json(payload);
});

router.post("/deactivate", authRequired, async (req, res) => {
  const payload = await setPremiumState(req.user._id, false);
  return res.json(payload);
});

export default router;
