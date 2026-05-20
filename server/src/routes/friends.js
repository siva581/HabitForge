import { Router } from "express";
import User from "../models/User.js";
import HabitLog from "../models/HabitLog.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function hasFriend(friendIds = [], userId) {
  return friendIds.some((id) => id.toString() === userId);
}

function toFriendView(friend) {
  return {
    id: friend._id,
    name: friend.name,
    email: friend.email,
    avatarSeed: friend.avatarSeed,
    level: friend.level,
    xp: friend.xp,
    isPremium: friend.isPremium
  };
}

router.use(authRequired);

// Add friend
router.post("/:userId", async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    return res.status(400).json({ message: "Cannot add yourself as a friend" });
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = await User.findById(currentUserId);
  if (hasFriend(user.friendIds, targetUserId)) {
    return res.status(409).json({ message: "Already friends with this user" });
  }

  user.friendIds.push(targetUserId);
  await user.save();

  return res.json({ message: "Friend added successfully" });
});

// Remove friend
router.delete("/:userId", async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user._id.toString();

  const user = await User.findById(currentUserId);
  user.friendIds = user.friendIds.filter((id) => id.toString() !== targetUserId);
  await user.save();

  return res.json({ message: "Friend removed successfully" });
});

// List my friends
router.get("/", async (req, res) => {
  const user = await User.findById(req.user._id).populate("friendIds", "name email avatarSeed level xp isPremium");

  return res.json({
    friends: user.friendIds.map(toFriendView)
  });
});

// Check if user is friend
router.get("/check/:userId", async (req, res) => {
  const targetUserId = req.params.userId;
  const user = await User.findById(req.user._id);

  const isFriend = hasFriend(user.friendIds, targetUserId);

  return res.json({ isFriend });
});

export default router;
