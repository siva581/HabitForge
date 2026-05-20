import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import habitRoutes from "./routes/habits.js";
import dashboardRoutes from "./routes/dashboard.js";
import analyticsRoutes from "./routes/analytics.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import friendsRoutes from "./routes/friends.js";
import usersRoutes from "./routes/users.js";
import exportRoutes from "./routes/export.js";
import premiumRoutes from "./routes/premium.js";

const app = express();
const corsOrigins = process.env.CLIENT_ORIGIN?.split(",") || true;

const apiRoutes = [
  ["/api/auth", authRoutes],
  ["/api/habits", habitRoutes],
  ["/api/dashboard", dashboardRoutes],
  ["/api/analytics", analyticsRoutes],
  ["/api/leaderboard", leaderboardRoutes],
  ["/api/friends", friendsRoutes],
  ["/api/users", usersRoutes],
  ["/api/export", exportRoutes],
  ["/api/premium", premiumRoutes]
];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "habitforge" });
});

apiRoutes.forEach(([path, handler]) => {
  app.use(path, handler);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

export default app;
