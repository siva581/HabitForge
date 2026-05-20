import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    completedAt: { type: Date, required: true, index: true },
    completionKey: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    xpAwarded: { type: Number, default: 0 },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

habitLogSchema.index({ habitId: 1, completionKey: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, completedAt: -1 });

export default mongoose.model("HabitLog", habitLogSchema);
