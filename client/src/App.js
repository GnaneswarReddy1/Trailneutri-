import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import Dashboard from "./components/Dashboard/Dashboard";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import LoadingSpinner from "./components/Common/LoadingSpinner";

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data.user);
      } else {
        // Token might be invalid
        console.error("Token invalid or expired");
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken, userData, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("token", newToken);
    } else {
      sessionStorage.setItem("token", newToken);
    }
    setToken(newToken);
    setUserInfo(userData);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setUserInfo(null);
    navigate("/login", { replace: true, state: { from: 'logout' } });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/login" 
          element={
            !token ? (
              <LoginForm onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            !token ? (
              <SignupForm />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/forgot-password" 
          element={<ForgotPassword />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        <Route 
          path="/dashboard" 
          element={
            token ? (
              <Dashboard 
                userInfo={userInfo} 
                onLogout={handleLogout}
                onUpdateUser={setUserInfo}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;