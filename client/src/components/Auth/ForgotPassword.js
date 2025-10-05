import React, { useState } from "react";
import { Link } from "react-router-dom";

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email & Phone, 2: New Password
  const [formData, setFormData] = useState({
    email: "",
    countryCode: "+1",
    phoneNumber: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // Country codes for dropdown
  const countryCodes = [
    { code: "+1", country: "US/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+61", country: "Australia" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+81", country: "Japan" },
    { code: "+86", country: "China" },
    { code: "+7", country: "Russia" },
    { code: "+55", country: "Brazil" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format phone number as user types
  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format based on length
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 6) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
    }
    
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
  };

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation
    if (!formData.email || !formData.phoneNumber) {
      setMessage("❌ Please fill in all required fields");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // Remove dashes from phone number for verification
    const cleanPhoneNumber = formData.phoneNumber.replace(/-/g, '');
    const fullPhoneNumber = formData.countryCode + cleanPhoneNumber;

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          phoneNumber: fullPhoneNumber 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Verification successful");
        setMessageType("success");
        setStep(2); // Move to password reset step
      } else {
        setMessage("❌ " + (data.message || "Email and phone number don't match our records"));
        setMessageType("error");
      }
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("❌ Passwords do not match");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage("❌ Password must be at least 6 characters long");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          newPassword: formData.newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + (data.message || "Password reset successfully!"));
        setMessageType("success");
        
        // Reset form and go back to step 1 after success
        setTimeout(() => {
          setFormData({
            email: "",
            countryCode: "+1",
            phoneNumber: "",
            newPassword: "",
            confirmPassword: ""
          });
          setStep(1);
        }, 3000);
      } else {
        setMessage("❌ " + (data.message || "Failed to reset password"));
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
          <h2 style={titleStyle}>
            {step === 1 ? "Verify Your Identity" : "Create New Password"}
          </h2>
          <p style={subtitleStyle}>
            {step === 1 
              ? "Enter your email and phone number to verify your identity"
              : "Enter your new password and confirm it"
            }
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

        {step === 1 ? (
          <form onSubmit={handleVerifyUser} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Phone Number *</label>
              <div style={phoneContainerStyle}>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  style={countryCodeStyle}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code} ({country.country})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="123-456-7890"
                  value={formData.phoneNumber}
                  onChange={handlePhoneNumberChange}
                  required
                  style={{ ...inputStyle, ...phoneInputStyle }}
                  maxLength="12"
                />
              </div>
              <small style={hintStyle}>Format: 123-456-7890</small>
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
                  Verifying...
                </div>
              ) : (
                "Verify Identity"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>New Password *</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                style={inputStyle}
                minLength="6"
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={inputStyle}
                minLength="6"
              />
            </div>

            <div style={buttonGroupStyle}>
              <button 
                type="button"
                onClick={() => setStep(1)}
                style={backButtonStyle}
              >
                Back
              </button>
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
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}

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

// Styles
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
  borderRadius: '20px',
  padding: '2rem',
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
  ':focus': {
    borderColor: '#00695c',
  }
};

const phoneContainerStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

const countryCodeStyle = {
  padding: '0.75rem 0.5rem',
  borderRadius: '10px',
  border: '2px solid #e2e8f0',
  fontSize: '1rem',
  background: 'white',
  cursor: 'pointer',
  minWidth: '120px',
};

const phoneInputStyle = {
  flex: 1,
};

const hintStyle = {
  color: '#718096',
  fontSize: '0.8rem',
  marginTop: '0.25rem',
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
  flex: 1,
};

const backButtonStyle = {
  padding: '1rem 2rem',
  background: '#e2e8f0',
  color: '#4a5568',
  border: 'none',
  borderRadius: '10px',
  fontSize: '1.1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginTop: '1rem',
  flex: 1,
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '1rem',
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