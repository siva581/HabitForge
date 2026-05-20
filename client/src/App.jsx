import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { HabitsPage } from "./pages/HabitsPage.jsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.jsx";
import { LeaderboardPage } from "./pages/LeaderboardPage.jsx";
import { FriendsPage } from "./pages/FriendsPage.jsx";
import { UpgradePage } from "./pages/UpgradePage.jsx";

function RedirectBySession({ user }) {
  return <Navigate to={user ? "/dashboard" : "/"} replace />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Forging your session...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="upgrade" element={<UpgradePage />} />
      </Route>
      <Route path="*" element={<RedirectBySession user={user} />} />
    </Routes>
  );
}
