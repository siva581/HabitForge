import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { badgeDetails, xpProgress } from "../utils/gamification.js";

const router = Router();

function normalizeEmail(email = "") {
  return email.toLowerCase();
}

function buildToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  const progress = xpProgress(user.xp || 0);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    timezone: user.timezone,
    avatarSeed: user.avatarSeed,
    level: progress.level,
    xp: user.xp || 0,
    xpFloor: progress.currentFloor,
    xpCeil: progress.nextFloor,
    xpProgress: progress.progress,
    isPremium: user.isPremium,
    badgeKeys: user.badgeKeys || [],
    badges: badgeDetails(user.badgeKeys || [])
  };
}

router.post("/register", async (req, res) => {
  const { name, email, password, timezone = "UTC" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    timezone,
    avatarSeed: name.toLowerCase().replace(/\s+/g, "-")
  });

  const token = buildToken(user);
  return res.status(201).json({ token, user: sanitizeUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const matches = await bcrypt.compare(password || "", user.passwordHash);
  if (!matches) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = buildToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

router.get("/me", authRequired, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

router.put("/profile", authRequired, async (req, res) => {
  const { avatarSeed } = req.body;

  if (!avatarSeed || typeof avatarSeed !== "string" || avatarSeed.trim().length === 0) {
    return res.status(400).json({ message: "Valid avatarSeed is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarSeed: avatarSeed.trim() },
      { new: true }
    );

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
