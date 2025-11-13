import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import "./App.css";

import Login from "./Pages/Login";
import Dashboard from "./components/Dashboard";
import DailyCheckin from "./Pages/Dailycheckin";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Profile from "./Pages/Profile";
import Partner from "./Pages/Partner";
import Answer from "./Pages/Dailycheckin/Answer";
import Weaklyquestion from "./Pages/Weaklyquestion";
import RecommendationsEngine from "./Pages/Recommendationsengine";
import Resultanalytics from "./Pages/Resultanalytics";
import Leaderboard from "./Pages/Leaderboard";
import Relationship from "./Pages/Relatonship";
import WeaklyAnswer from "./Pages/Weaklyquestion/Weaklyanswer";
import Raitinglist from "./Pages/Dailycheckin/Ratinglist";
import Weaklyrating from "./Pages/Weaklyquestion/Weaklyrating";
import Subscription from "./Pages/Subscription";
import Plan from "./Pages/Plan";

const PrivateRoute = ({ isLoggedIn, loading }) => {
  if (loading) return null;
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

const Layout = ({ isLoggedIn, handleLogout }) => {
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const hideLayoutRoutes = ["/login"];
  const shouldShowLayout =
    isLoggedIn && !hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowLayout && (
        <Header
          toggleSidebar={() => setSidebarVisible((prev) => !prev)}
          sidebarVisible={sidebarVisible}
        />
      )}

      <div className="layout-container">
        {shouldShowLayout && (
          <Sidebar
            sidebarVisible={sidebarVisible}
            handleLogout={handleLogout}
          />
        )}

        <div
          className={`main-content ${
            sidebarVisible ? "sidebar-open" : "sidebar-collapsed"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
        />

        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          element={<Layout isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
        >
          <Route element={<PrivateRoute isLoggedIn={isLoggedIn} loading={loading} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/daily-check-in" element={<DailyCheckin />} />
            <Route path="/settings/profile" element={<Profile />} />
            <Route path="/partner-list" element={<Partner />} />
            <Route path="/dealy-check-in-answer" element={<Answer />} />
            <Route path="/weakly-question" element={<Weaklyquestion />} />
            <Route path="/recomendation-engine" element={<RecommendationsEngine />} />
            <Route path="/result-analytics" element={<Resultanalytics />} />
            <Route path="/leaderboard-gamification" element={<Leaderboard />} />
            <Route path="/relationship-progres" element={<Relationship />} />
            <Route path="/weakly-answer" element={<WeaklyAnswer />} />
            <Route path="/daily-rating-list" element={<Raitinglist />} />
            <Route path="/weakly-rating-list" element={<Weaklyrating />} />
            <Route path="/subscription-list" element={<Subscription />} />
            <Route path="/plan-list" element={<Plan />} />

          </Route>
        </Route>

        <Route
          path="*"
          element={
            <div style={{ padding: "2rem" }}>
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
