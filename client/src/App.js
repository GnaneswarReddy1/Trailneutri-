import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import Dashboard from "./components/Dashboard/Dashboard";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import LoadingSpinner from "./components/Common/LoadingSpinner";

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
      const response = await fetch("http://localhost:4000/api/dashboard", {
        headers: { Authorization: token },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        // Token might be invalid
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
    localStorage.clear();
    sessionStorage.clear();
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