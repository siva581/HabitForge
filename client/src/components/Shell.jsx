import { Link, NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { Avatar } from "./Avatar.jsx";
import { RewardToast } from "./RewardToast.jsx";

export function Shell() {
  const { user, logout, reward, clearReward } = useAuth();
  const { toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const xpPercent = Math.max(0, Math.min(100, Math.round((user?.xpProgress || 0) * 100)));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">H</span>
          <span>
            <strong>HabitForge</strong>
            <small>Daily XP, real streaks</small>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/dashboard" end>Dashboard</NavLink>
          <NavLink to="/dashboard/habits">Habits</NavLink>
          <NavLink to="/dashboard/analytics">Analytics</NavLink>
          <NavLink to="/dashboard/leaderboard">Leaderboard</NavLink>
          <NavLink to="/dashboard/friends">Friends</NavLink>
          <NavLink to="/dashboard/upgrade">Upgrade</NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="ghost-button" onClick={toggleTheme} type="button">
            Toggle theme
          </button>
          <button className="ghost-button" onClick={logout} type="button">Log out</button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Navigation Drawer */}
      <nav className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-header">
          <Link to="/dashboard" className="mobile-brand" onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-mark">H</span>
            <span>HabitForge</span>
          </Link>
          <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>

        <div className="mobile-nav-links">
          <NavLink to="/dashboard" end onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/dashboard/habits" onClick={() => setMobileMenuOpen(false)}>Habits</NavLink>
          <NavLink to="/dashboard/analytics" onClick={() => setMobileMenuOpen(false)}>Analytics</NavLink>
          <NavLink to="/dashboard/leaderboard" onClick={() => setMobileMenuOpen(false)}>Leaderboard</NavLink>
          <NavLink to="/dashboard/friends" onClick={() => setMobileMenuOpen(false)}>Friends</NavLink>
          <NavLink to="/dashboard/upgrade" onClick={() => setMobileMenuOpen(false)}>Upgrade</NavLink>
        </div>

        <div className="mobile-nav-footer">
          <button className="ghost-button" onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} type="button">
            Toggle theme
          </button>
          <button className="ghost-button" onClick={() => { logout(); setMobileMenuOpen(false); }} type="button">
            Log out
          </button>
        </div>
      </nav>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-content">
            <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} type="button">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <Avatar seed={user?.avatarSeed || "forge"} size={56} />
            <div>
              <p className="eyebrow">Welcome back</p>
              <h1>{user?.name || "HabitForge"}</h1>
              <p className="topbar-subtitle">Your next level is warming up. Keep the streak alive.</p>
            </div>
          </div>
          <div className="topbar-hud">
            <div className="topbar-chip">Level {user?.level || 1}</div>
            <div className="topbar-progress">
              <div className="topbar-progress__fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <span className="topbar-xp">{Math.round((user?.xpProgress || 0) * 100)}% to next level</span>
          </div>
        </header>

        <motion.section className="content-wrap" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Outlet />
        </motion.section>
      </main>

      <RewardToast reward={reward} onDismiss={clearReward} />
    </div>
  );
}
