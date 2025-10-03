import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    console.log("🔗 Verification page loaded");
    console.log("📨 URL token:", token);
    
    if (token) {
      console.log("🚀 Starting verification with token...");
      verifyEmail(token);
    } else {
      console.log("❌ No token in URL");
      setMessage("❌ No verification token provided");
      setMessageType("error");
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    setLoading(true);
    setMessage("");
    console.log("📤 Sending verification request to server...");
    
    try {
      const response = await fetch("http://localhost:4000/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      console.log("📥 Server response status:", response.status);
      const data = await response.json();
      console.log("📦 Server response data:", data);

      if (response.ok) {
        console.log("✅ Verification successful on server");
        setMessage("✅ " + data.message);
        setMessageType("success");
        setVerified(true);
      } else {
        console.log("❌ Verification failed on server:", data.message);
        setMessage("❌ " + data.message);
        setMessageType("error");
        setVerified(false);
      }
    } catch (err) {
      console.log("💥 Network error during verification:", err);
      setMessage("❌ Server error: " + err.message);
      setMessageType("error");
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    console.log("🔙 Navigating to login...");
    navigate("/login");
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoStyle}>
            <span style={logoIcon}>🏥</span>
            <h1 style={logoText}>HealthCare+</h1>
          </div>
          <h2 style={titleStyle}>Email Verification</h2>
        </div>

        {loading ? (
          <div style={loadingContainerStyle}>
            <div style={spinnerStyle}></div>
            <p style={loadingTextStyle}>Verifying your email...</p>
            <p style={debugTextStyle}>Checking token validity...</p>
          </div>
        ) : (
          <>
            <div style={{
              ...messageStyle,
              background: messageType === "success" ? "#d4edda" : "#f8d7da",
              color: messageType === "success" ? "#155724" : "#721c24",
              border: messageType === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
            }}>
              {message}
            </div>

            {verified && (
              <div style={successContainerStyle}>
                <div style={successIconStyle}>🎉</div>
                <h3 style={successTitleStyle}>Email Verified Successfully!</h3>
                <p style={successTextStyle}>
                  Your email has been successfully verified. You can now login to your account.
                </p>
                <button 
                  onClick={handleBackToLogin}
                  style={successButtonStyle}
                >
                  Continue to Login
                </button>
              </div>
            )}

            {!verified && !loading && (
              <div style={footerStyle}>
                <p style={helpTextStyle}>
                  Need a new verification email?{" "}
                  <Link to="/login" style={linkStyle}>
                    Try logging in
                  </Link>
                </p>
                <Link to="/login" style={buttonStyle}>
                  Back to Login
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Styles
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
  textAlign: 'center',
  animation: 'fadeIn 0.6s ease-out',
};

const headerStyle = {
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
  margin: 0,
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  padding: '2rem 0',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e2e8f0',
  borderTop: '4px solid #00695c',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const loadingTextStyle = {
  color: '#718096',
  fontSize: '1rem',
  margin: 0,
};

const debugTextStyle = {
  color: '#a0aec0',
  fontSize: '0.8rem',
  margin: 0,
  fontStyle: 'italic',
};

const messageStyle = {
  padding: '1.5rem',
  borderRadius: '10px',
  marginBottom: '1.5rem',
  fontSize: '1rem',
  lineHeight: '1.5',
};

const successContainerStyle = {
  padding: '2rem 0',
  textAlign: 'center',
};

const successIconStyle = {
  fontSize: '4rem',
  marginBottom: '1rem',
};

const successTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0 0 1rem 0',
};

const successTextStyle = {
  fontSize: '1rem',
  color: '#718096',
  marginBottom: '2rem',
  lineHeight: '1.5',
};

const successButtonStyle = {
  padding: '1rem 2rem',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1.1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const footerStyle = {
  marginTop: '1.5rem',
};

const buttonStyle = {
  display: 'inline-block',
  padding: '0.75rem 2rem',
  background: 'linear-gradient(135deg, #00695c, #004d40)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '10px',
  fontWeight: '600',
  transition: 'all 0.3s ease',
  marginBottom: '1rem',
};

const helpTextStyle = {
  color: '#718096',
  fontSize: '0.9rem',
  margin: '0 0 1rem 0',
};

const linkStyle = {
  color: '#00695c',
  textDecoration: 'none',
  fontWeight: '500',
};

export default VerifyEmail;