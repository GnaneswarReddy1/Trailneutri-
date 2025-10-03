import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("https://react-app-1-zmq6.onrender.com/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        setMessageType("success");
        setEmail("");
      } else {
        setMessage("❌ " + data.message);
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
            <h1 style={logoText}>HealthCare+</h1>
          </div>
          <h2 style={titleStyle}>Reset Your Password</h2>
          <p style={subtitleStyle}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
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
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

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
                Sending Reset Link...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={footerTextStyle}>
            Remember your password?{" "}
            <Link to="/login" style={linkStyle}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles (similar to previous components)
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const cardStyle = {
  background: 'white',
  borderRadius: '20px',
  padding: '3rem',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '500px',
  animation: 'fadeIn 0.6s ease-out',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const logoIcon = {
  fontSize: '2.5rem',
};

const logoText = {
  fontSize: '1.8rem',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  margin: 0,
};

const titleStyle = {
  fontSize: '1.8rem',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0.5rem 0',
};

const subtitleStyle = {
  color: '#718096',
  fontSize: '1rem',
  margin: 0,
  lineHeight: '1.5',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontWeight: '500',
  color: '#4a5568',
  fontSize: '0.9rem',
};

const inputStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '10px',
  border: '2px solid #e2e8f0',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  outline: 'none',
};

const buttonStyle = {
  padding: '1rem 2rem',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1.1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginTop: '1rem',
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '2rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid #e2e8f0',
};

const footerTextStyle = {
  color: '#718096',
  margin: 0,
};

const linkStyle = {
  color: '#00695c',
  textDecoration: 'none',
  fontWeight: '600',
};

const messageStyle = {
  padding: '1rem',
  borderRadius: '10px',
  marginBottom: '1.5rem',
  fontSize: '0.9rem',
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

export default ForgotPassword;