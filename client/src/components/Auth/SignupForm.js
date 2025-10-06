import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../Common/PasswordStrengthMeter";
import countryCodes from "../../data/countryCodes";

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    Username: "",
    email: "",
    countryCode: "+1",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    weightUnit: "kg"
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Convert ISO country code (e.g. 'US') to emoji flag
  const getFlagEmoji = (isoCode) => {
    if (!isoCode) return '';
    try {
      const codePoints = isoCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '';
    }
  };

  // Format phone as (123)-456-7890 as user types (US-style 10-digit formatting)
  const formatphone = (digits) => {
    const d = digits.replace(/\D/g, '').slice(0, 10);
    if (d.length === 0) return '';
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0,3)})-${d.slice(3)}`;
    return `(${d.slice(0,3)})-${d.slice(3,6)}-${d.slice(6,10)}`;
  };

  const handlephoneChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    const formatted = formatphone(digits);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  // Basic validation
  const phoneDigits = (formData.phone || '').replace(/\D/g, '');
  
  // FIXED: Check all required fields including phone
  if (!formData.Username || !formData.email || !formData.password || !phoneDigits) {
    setMessage("❌ Please fill in all required fields");
    setMessageType("error");
    setLoading(false);
    return;
  }
  
  // Require phone of 10 digits
  if (phoneDigits.length !== 10) {
    setMessage("❌ Please enter a valid 10-digit phone number");
    setMessageType("error");
    setLoading(false);
    return;
  }
  
  if (formData.password !== formData.confirmPassword) {
    setMessage("❌ Passwords do not match");
    setMessageType("error");
    setLoading(false);
    return;
  }

    // Convert height to cm if needed
    let heightInCm;
    if (formData.heightFeet && formData.heightInches) {
      const totalInches = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches);
      heightInCm = Math.round(totalInches * 2.54);
    }

    // Convert weight to kg if in lbs
    let weightInKg = formData.weight;
    if (formData.weightUnit === "lbs" && formData.weight) {
      weightInKg = Math.round(parseFloat(formData.weight) * 0.453592);
    }

    const userData = {
      username: formData.Username,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      height: heightInCm || "",
      weight: weightInKg || "",
      phone: `${formData.countryCode}${phoneDigits}`,
      phoneFormatted: formData.phone,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        setMessageType("success");
        
        // Clear form
        setFormData({
          Username: "",
          email: "",
          countryCode: "+1",
          phone: "",
          password: "",
          confirmPassword: "",
          gender: "",
          heightFeet: "",
          heightInches: "",
          weight: "",
          weightUnit: "kg"
        });

        // Redirect to login with success message
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              from: 'signup',
              message: "You've registered successfully! You can now login."
            } 
          });
        }, 1500);
      } else {
        setMessage("❌ " + (data.message || "Signup failed"));
        setMessageType("error");
        if (data.feedback) {
          setMessage(prev => prev + "\n" + data.feedback.join("\n"));
        }
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
          <h2 style={titleStyle}>Create Your Account</h2>
        </div>

        {message && (
          <div style={{
            ...messageStyle,
            background: messageType === "success" ? "#d4edda" : "#f8d7da",
            color: messageType === "success" ? "#155724" : "#721c24",
            border: messageType === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
          }}>
            {message.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Username */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              name="Username"
              placeholder="Enter your username"
              value={formData.Username}
              onChange={handleChange}
              required
              style={inputStyle}
              disabled={loading}
            />
          </div>

          {/* Email */}
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

          {/* Phone (country code + formatted number) */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Phone Number</label>
            <div style={phoneRowStyle}>
              <div style={countrySelectInline}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* Native select with full labels for the dropdown */}
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    style={{ ...selectStyle, ...nativeSelectStyle }}
                    disabled={loading}
                  >
                    {countryCodes.map(c => (
                      <option key={c.code} value={c.dial_code} title={c.name}>{`${getFlagEmoji(c.code)} ${c.name} (${c.dial_code})`}</option>
                    ))}
                  </select>

                  {/* Visible compact display: only the dial code */}
                  <div style={countryDisplayStyle} aria-hidden>{formData.countryCode}</div>
                  <span style={{ ...selectArrowStyle, right: '8px' }}>▼</span>
                </div>
              </div>
              <input
                type="text"
                name="phone"
                placeholder="(123)-456-7890"
                value={formData.phone}
                onChange={handlephoneChange}
                required
                style={phoneInputStyle}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <div style={passwordContainerStyle}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
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
            <PasswordStrengthMeter password={formData.password} />
          </div>

          {/* Confirm Password */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={passwordContainerStyle}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ ...inputStyle, paddingRight: '45px' }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                style={passwordToggleStyle}
                title={showConfirmPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                <span style={passwordIconStyle}>
                  {showConfirmPassword ? "🔓" : "🔒"}
                </span>
              </button>
            </div>
          </div>

          {/* Gender */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Gender</label>
            <div style={customSelectContainer}>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={selectStyle}
                className="custom-select"
                disabled={loading}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <span style={selectArrowStyle}>▼</span>
            </div>
          </div>

          {/* Height and Weight Side by Side */}
          <div style={measurementsContainerStyle}>
            {/* Height */}
            <div style={measurementGroupStyle}>
              <label style={labelStyle}>Height</label>
              <div style={heightContainerStyle}>
                <div style={heightSelectContainerStyle}>
                  <select
                    name="heightFeet"
                    value={formData.heightFeet}
                    onChange={handleChange}
                    required
                    style={selectSmallStyle}
                    className="custom-select"
                    disabled={loading}
                  >
                    <option value="">Feet</option>
                    {[...Array(8)].map((_, i) => {
                      const feet = 4 + i;
                      return <option key={feet} value={feet}>{feet}</option>;
                    })}
                  </select>
                  <span style={selectArrowStyle}>▼</span>
                </div>
                <div style={heightSelectContainerStyle}>
                  <select
                    name="heightInches"
                    value={formData.heightInches}
                    onChange={handleChange}
                    required
                    style={selectSmallStyle}
                    className="custom-select"
                    disabled={loading}
                  >
                    <option value="">Inches</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <span style={selectArrowStyle}>▼</span>
                </div>
              </div>
              <div style={unitLabelStyle}>ft & in</div>
            </div>

            {/* Weight */}
            <div style={measurementGroupStyle}>
              <label style={labelStyle}>Weight</label>
              <div style={weightContainerStyle}>
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  style={weightInputStyle}
                  min="1"
                  max="1000"
                  disabled={loading}
                />
                <div style={unitSelectContainerStyle}>
                  <select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleChange}
                    style={unitSelectStyle}
                    className="custom-select"
                    disabled={loading}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                  <span style={selectArrowStyle}>▼</span>
                </div>
              </div>
            </div>
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
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div style={footerStyle}>
          <p style={footerTextStyle}>
            Already have an account?{" "}
            <Link to="/login" style={linkStyle}>
              Sign In
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
  borderRadius: '15px',
  padding: '2rem',
  boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '450px',
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
  margin: '0.5rem 0',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0rem',
};

const measurementsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '1rem',
  alignItems: 'start',
};

const measurementGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  justifyContent: 'flex-start',
};

const labelStyle = {
  fontWeight: '500',
  color: '#4a5568',
  fontSize: '0.9rem',
  marginBottom: '0.25rem',
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

const customSelectContainer = {
  position: 'relative',
  width: '100%'
};

const unitSelectContainerStyle = {
  position: 'relative',
  width: '80px',
  minWidth: '60px',
};

const heightSelectContainerStyle = {
  position: 'relative',
  flex: 1,
  minWidth: 0,
};

const selectStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '2px solid #e2e8f0',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontFamily: 'inherit',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

const selectSmallStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '2px solid #e2e8f0',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontFamily: 'inherit',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

const selectArrowStyle = {
  position: 'absolute',
  right: '6px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: '#718096',
  fontSize: '0.8rem',
};

const phoneRowStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center'
};

// Make the country select compact so the phone input remains the large field
const countrySelectInline = {
  position: 'relative',
  width: '80px',
  minWidth: '60px',
  display: 'inline-block'
};
// native select sits on top but is invisible so users get the full dropdown
const nativeSelectStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  zIndex: 3,
  cursor: 'pointer'
};

// compact visible overlay that shows only the dial code
const countryDisplayStyle = {
  position: 'absolute',
  top: '50%',
  left: '10px',
  transform: 'translateY(-50%)',
  zIndex: 2,
  color: '#2d3748',
  fontWeight: 600,
};
const phoneInputStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '2px solid #e2e8f0',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  outline: 'none',
  flex: 1,
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};

const heightContainerStyle = {
  display: 'flex',
  gap: '0.5rem',
  width: '100%',
  alignItems: 'center',
};

const weightContainerStyle = {
  display: 'flex',
  gap: '0.5rem',
  width: '100%',
  alignItems: 'center',
};

const weightInputStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '2px solid #e2e8f0',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  outline: 'none',
  flex: 1,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const unitSelectStyle = {
  padding: '0.75rem',
  borderRadius: '8px',
  border: '2px solid #e2e8f0',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
  outline: 'none',
  width: '80px',
  boxSizing: 'border-box',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontFamily: 'inherit',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

const unitLabelStyle = {
  fontSize: '0.8rem',
  color: '#718096',
  textAlign: 'center',
  marginTop: '0.25rem',
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
  lineHeight: '1.3',
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

export default SignupForm;