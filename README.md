# HabitForge
<<<<<<< HEAD

HabitForge is a gamified habit tracker built as a small RPG. The point is simple: tracking habits should feel rewarding enough that people want to come back tomorrow.

This repo is a plain MERN stack project. There is no Docker setup, no container workflow, and no extra platform layer sitting between the code and the app.

## What It Does

- Habit CRUD with daily and weekly frequencies.
- Dynamic streak calculation based on the user's timezone.
- XP, level progression, and badge unlocking.
- Chart-driven analytics with a 30-day line graph and a year-style heatmap.
- A freemium tier that keeps the core loop free but gates analytics, exports, and unlimited habits.
- A seeded demo account with three months of habit history so the dashboard is never empty.

## Stack

- Frontend: React, Vite, Framer Motion, Chart.js.
- Backend: Node.js, Express, MongoDB, Mongoose.
- Date handling: date-fns and date-fns-tz.
- Build style: straightforward JavaScript modules and small reusable helpers.

## Demo Login

- Email: demo@habitforge.app
- Password: HabitForge123!

## Run It Locally

1. Start MongoDB locally.
2. Copy [server/.env.example](server/.env.example) to `server/.env` and set your values.
3. Install dependencies with `npm install` from the repo root.
4. Seed the database with `npm run seed`.
5. Start the app with `npm run dev`.

The client runs on port `5173` and the API runs on port `5000` by default.

## Streak Calculation

HabitForge stores each completion in a dedicated `HabitLog` collection instead of keeping an array of dates on the habit itself. That makes the history easier to query for charts and keeps the data model from getting awkward as the app grows.

When a user checks in, the app converts the current time into the user's timezone and builds a period key. For daily habits, that key is a date like `2026-05-12`. For weekly habits, it uses the ISO week key like `2026-W20`.

The next streak is decided from the last completed period:

- If the last completion is the current period, the app blocks the duplicate check-in.
- If the last completion is the previous period, the streak increases by one.
- If one or more periods were missed, the active streak is reset to `0`.

That keeps the streak logic strict but fair. Someone who checks in late at night in New York should not lose a streak just because the server is running in UTC. The user's timezone is the source of truth for period boundaries.

## Premium Gating

Free users can track the core habits. Premium users unlock:

- The 365-day heatmap.
- CSV export.
- Unlimited active habits.

The backend protects those features with `isPremium` checks, so the gate is not just a frontend disguise.

## Notes

- The demo account is seeded with 90 days of history, so the charts look populated right away.
- The project uses a separate `HabitLog` collection because time-series data is much easier to work with that way.
- If you want a production deployment, set the client API base URL and point the server at a real MongoDB instance.
=======
Habit tracking web application built with React, Node.js and MongoDB.
>>>>>>> 399840f90ad5a2c53e0f1105e85136e10293bee9
