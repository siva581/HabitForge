import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { useState, useEffect } from "react";
import { isHabitCompleteForCurrentPeriod } from "../utils/habitPeriod.js";

const previewHabits = [
  { title: "Morning Workout", lastCompletedAt: null },
  { title: "Read 30 mins", lastCompletedAt: null },
  { title: "Meditate", lastCompletedAt: null }
];

function getThemeName() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function firstName(name = "") {
  return name.split(" ")[0] || name;
}

function ThemeToggle() {
  const { toggleTheme } = useTheme();
  const [theme, setTheme] = useState(getThemeName());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getThemeName());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <button className="theme-toggle" onClick={() => toggleTheme()} aria-label="Toggle theme" style={{ marginRight: 12 }}>
      {theme === "light" ? "🌞" : "🌙"}
    </button>
  );
}

export function LandingPage() {
  const { user, summary, loading, refreshSummary } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      refreshSummary().catch(() => {});
    }
  }, [user, loading, refreshSummary]);

  const isLoggedIn = Boolean(user && !loading);
  const habitsForPreview = (summary?.habits || previewHabits).slice(0, 3);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡</span>
            HabitForge
          </Link>
          <nav className="header-nav">
            <a href="#features">Features</a>
            <a href="#why">Why Us</a>
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="link-login">Dashboard</Link>
                <Link to="/dashboard" className="btn-start">Open</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="link-login">Sign In</Link>
                <Link to="/login" className="btn-start">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero-section">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {isLoggedIn ? (
            <>
              <div className="hero-text">
                <h1>Welcome back, {firstName(user.name)} 👋</h1>
                <p>Level {user.level} · {Math.round((user.xpProgress || 0) * 100)}% to next level · {summary?.totals?.completions || 0} recent check-ins</p>
                <div className="hero-cta">
                  <Link to="/dashboard" className="btn btn-lg btn-primary">Go to Dashboard</Link>
                  <Link to="/dashboard/habits" className="btn btn-lg btn-outline">View Habits</Link>
                </div>
                <div className="hero-stats">
                  <div className="stat">
                    <strong>{summary?.totals?.habits ?? 0}</strong>
                    <span>Active habits</span>
                  </div>
                  <div className="stat">
                    <strong>{summary?.totals?.streaksActive ?? 0}</strong>
                    <span>Streaks active</span>
                  </div>
                  <div className="stat">
                    <strong>{(user.badges || []).length}</strong>
                    <span>Badges</span>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="visual-card">
                  <div className="card-header">Today's Progress</div>
                  <div className="card-content">
                    {habitsForPreview.map((habit, idx) => {
                      const completed = isHabitCompleteForCurrentPeriod(habit);
                      const width = completed ? "100%" : "6%";
                      return (
                        <div className="progress-item" key={idx}>
                          <span>{habit.title}</span>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="label">Streak</span>
                      <span className="value">{Math.max(0, ...(summary?.habits || []).map((habit) => habit.streak || 0))} days</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">XP Earned</span>
                      <span className="value">{user?.xp || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="hero-text">
                <h1>Master Your Habits, One Day at a Time</h1>
                <p>Track streaks, earn XP, and build consistency with the habit tracker built for real people who want real results.</p>
                <div className="hero-cta">
                  <Link to="/login" className="btn btn-lg btn-primary">Start Free Today</Link>
                  <a href="#demo" className="btn btn-lg btn-outline">See it in Action</a>
                </div>
                <div className="hero-stats">
                  <div className="stat">
                    <strong>New</strong>
                    <span>Built for early users</span>
                  </div>
                  <div className="stat">
                    <strong>Fresh</strong>
                    <span>Track habits from day one</span>
                  </div>
                  <div className="stat">
                    <strong>Beta</strong>
                    <span>Growing with your feedback</span>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="visual-card">
                  <div className="card-header">Today's Progress</div>
                  <div className="card-content">
                    <div className="progress-item">
                      <span>Morning Workout</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div className="progress-item">
                      <span>Read 30 mins</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "60%" }} />
                      </div>
                    </div>
                    <div className="progress-item">
                      <span>Meditate</span>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "30%" }} />
                      </div>
                    </div>
                  </div>
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="label">Streak</span>
                      <span className="value">42 days</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">XP Earned</span>
                      <span className="value">1,850</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </section>

      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Features</h2>
          <p>Everything you need to build lasting habits.</p>
        </div>
        <div className="features-grid">
          <motion.article
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">🔥</div>
            <h3>Streak Protection</h3>
            <p>Never lose momentum. Your streaks are protected, and daily check-ins keep you accountable and focused.</p>
          </motion.article>

          <motion.article
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">⭐</div>
            <h3>Gamified XP</h3>
            <p>Earn XP with every check-in, level up your profile, and compete with friends on the leaderboard.</p>
          </motion.article>

          <motion.article
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">🎯</div>
            <h3>Smart Goals</h3>
            <p>Set daily, weekly, or monthly habits with custom XP rewards and track your progress effortlessly.</p>
          </motion.article>

          <motion.article
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">📱</div>
            <h3>Cross-Device</h3>
            <p>Access your habits anywhere. Seamless sync across all your devices—phone, tablet, desktop.</p>
          </motion.article>

          <motion.article
            className="feature-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="feature-icon">👥</div>
            <h3>Community</h3>
            <p>Join a community of habit builders, share achievements, and stay motivated together.</p>
          </motion.article>
        </div>
      </section>

      <section id="why" className="why-section">
        <div className="section-header">
          <h2>Why HabitForge?</h2>
        </div>
        <div className="why-grid">
          <article className="why-card">
            <div className="why-number">01</div>
            <h3>Science-Backed</h3>
            <p>Built on habit formation research. We know what works, and we've designed HabitForge to leverage proven psychological principles.</p>
          </article>
          <article className="why-card">
            <div className="why-number">02</div>
            <h3>Beautifully Simple</h3>
            <p>No overwhelming features or complicated workflows. HabitForge is intuitive, clean, and focused on what matters—consistency.</p>
          </article>
          <article className="why-card">
            <div className="why-number">03</div>
            <h3>Your Privacy First</h3>
            <p>Your data is yours. We never sell your information, and everything is encrypted end-to-end.</p>
          </article>
        </div>
      </section>

      <section className="cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Build Better Habits?</h2>
          <p>Start with a clean slate and shape HabitForge together as we grow.</p>
          <Link to="/login" className="btn btn-lg btn-primary">Get Started Free</Link>
        </motion.div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>HabitForge</h4>
            <p>The habit tracker built for real consistency.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#why">Why Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Project</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HabitForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
