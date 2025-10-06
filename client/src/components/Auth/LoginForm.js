import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from signup
  useEffect(() => {
    if (location.state?.from === 'signup' && location.state?.message) {
      setMessage("✅ " + location.state.message);
      setMessageType("success");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        setMessage("✅ Login successful! Redirecting...");
        setMessageType("success");
        
        // Store token immediately in storage first
        if (formData.rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }
        
        // Call onLogin to update App.js state
        onLogin(data.token, data.user, formData.rememberMe);
        
        // Wait a brief moment to ensure state is updated, then navigate
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);
        
      } else {
        setMessage("❌ " + (data.message || "Login failed"));
        setMessageType("error");
      }
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoStyle}>
            <span style={logoIcon}>🏥</span>
            <h1 style={logoText}>TrailNeutri+</h1>
          </div>
          <h2 style={titleStyle}>Welcome Back</h2>
          <p style={subtitleStyle}>Sign in to your account</p>
        </div>

        {message && (
          <div style={{
            ...messageStyle,
            background: messageType === "success" ? "#d4edda" : "#f8d7da",
            color: messageType === "success" ? "#155724" : "#721c24",
            border: messageType === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div style={inputGroupStyle}>
            <div style={labelContainerStyle}>
              <label style={labelStyle}>Password</label>
              <Link to="/forgot-password" style={forgotPasswordStyle}>
                Forgot password?
              </Link>
            </div>
            <div style={passwordContainerStyle}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ ...inputStyle, paddingRight: '45px' }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={passwordToggleStyle}
                title={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                <span style={passwordIconStyle}>
                  {showPassword ? "🔓" : "🔒"}
                </span>
              </button>
            </div>
          </div>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              style={checkboxStyle}
              disabled={loading}
            />
            Remember me
          </label>

          <button 
            type="submit" 
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? (
              <div style={loadingStyle}>
                <div style={spinnerStyle}></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={footerTextStyle}>
            Don't have an account?{" "}
            <Link to="/signup" style={linkStyle}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles (keep all your existing styles exactly as they are)
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const cardStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '2rem',
  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px',
  animation: 'fadeIn 0.6s ease-out',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '1.5rem',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  marginBottom: '0.5rem',
};

const logoIcon = {
  fontSize: '2rem',
};

const logoText = {
  fontSize: '1.5rem',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  margin: 0,
};

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0.25rem 0',
};

const subtitleStyle = {
  color: '#718096',
  fontSize: '0.9rem',
  margin: 0,
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const labelStyle = {
  fontWeight: '500',
  color: '#4a5568',
  fontSize: '0.9rem',
};

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '2px solid #e2e8f0',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const passwordContainerStyle = {
  position: 'relative',
  width: '100%',
};

const passwordToggleStyle = {
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '8px',
  borderRadius: '4px',
  transition: 'all 0.2s ease',
};

const passwordIconStyle = {
  display: 'block',
  fontSize: '1.1rem',
  opacity: '0.7',
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.9rem',
  color: '#4a5568',
};

const checkboxStyle = {
  width: '16px',
  height: '16px',
};

const buttonStyle = {
  padding: '0.875rem 2rem',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginTop: '0.5rem',
  fontFamily: 'inherit',
};

const forgotPasswordStyle = {
  color: '#00695c',
  textDecoration: 'none',
  fontSize: '0.8rem',
  fontWeight: '500',
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '1.5rem',
  paddingTop: '1rem',
  borderTop: '1px solid #e2e8f0',
};

const footerTextStyle = {
  color: '#718096',
  margin: 0,
  fontSize: '0.9rem',
};

const linkStyle = {
  color: '#00695c',
  textDecoration: 'none',
  fontWeight: '600',
};

const messageStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  marginBottom: '1rem',
  fontSize: '0.85rem',
  textAlign: 'center',
};

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
};

const spinnerStyle = {
  width: '16px',
  height: '16px',
  border: '2px solid transparent',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

export default LoginForm;