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
    // Check if we have user info in storage
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserInfo(parsedUser);
        console.log("📱 Loaded user from storage:", parsedUser);
        console.log("📱 Username in storage:", parsedUser.username);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }
    
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Since your current backend doesn't have a protected dashboard endpoint,
      // we'll use the check-users endpoint or rely on the stored user data
      const response = await fetch(`${API_BASE_URL}/api/check-users`, {
        headers: { 
          "Content-Type": "application/json"
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Available users:", data.users);
        
        // If we have stored user info, use that (it should have the username)
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserInfo(parsedUser);
          console.log("✅ Using stored user data with username:", parsedUser.username);
        }
      } else {
        console.warn("Could not fetch users list, using stored data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Don't logout on error, use stored data
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newToken, userData, rememberMe = false) => {
    console.log("🔄 handleLogin called with user data:", userData);
    console.log("🔄 Username in login:", userData?.username);
    
    // Store token and user data
    if (rememberMe) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    
    setToken(newToken);
    setUserInfo(userData);
    
    console.log("✅ Login successful, navigating to dashboard...");
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 100);
  };

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUserInfo(null);
    navigate("/login", { replace: true });
  };

  const handleUpdateUser = (updatedUserInfo) => {
    setUserInfo(updatedUserInfo);
    // Also update storage
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      const currentStorage = localStorage.getItem("user") ? localStorage : sessionStorage;
      currentStorage.setItem("user", JSON.stringify(updatedUserInfo));
    }
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
                onUpdateUser={handleUpdateUser}
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