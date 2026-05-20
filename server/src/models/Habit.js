import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
    targetDays: [{ type: Number, min: 0, max: 6 }],
    color: { type: String, default: "#1DB954" },
    icon: { type: String, default: "bolt" },
    xpPerCheck: { type: Number, default: 20 },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    lastCompletedAt: { type: Date, default: null },
    archived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1, archived: 1, createdAt: -1 });

export default mongoose.model("Habit", habitSchema);
