import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function getBrowserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        const timezone = getBrowserTimezone();
        await register({ ...form, timezone });
      }
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="bg-orbs" aria-hidden>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <motion.section className="auth-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-copy">
          <div className="auth-hud" aria-hidden>
            <div className="level-badge">Welcome</div>
            <div className="xp-bar" aria-hidden>
              <div className="xp-fill" />
            </div>
          </div>
          <p className="eyebrow">Habit tracking with a pulse</p>
          <h1>Build streaks that feel worth protecting.</h1>
          <p>
            HabitForge gives your routine a little heat: XP, badges, streak pressure, and a dashboard that actually looks alive.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Maya" />
            </label>
          )}

          <label>
            Email
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Choose a password" />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" disabled={busy} type="submit">
            {busy ? "Working..." : mode === "login" ? "Enter dashboard" : "Create account"}
          </button>

          <p className="form-switch">
            {mode === "login" ? (
              <Link to="/register">Need an account? Create one.</Link>
            ) : (
              <Link to="/login">Already have one? Log in.</Link>
            )}
          </p>

          {mode === "login" && (
            <div className="demo-credentials" role="note" aria-label="Demo account credentials">
              <p className="demo-title">Demo account</p>
              <p>Email: demo@habitforge.app</p>
              <p>Password: HabitForge123!</p>
            </div>
          )}
        </form>
      </motion.section>
    </div>
  );
}
