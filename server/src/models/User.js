import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    avatarSeed: { type: String, default: "forge" },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    badgeKeys: { type: [String], default: [] },
    friendIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
