import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../Common/PasswordStrengthMeter";
import countryCodes from "../../data/countryCodes";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    countryCode: "+1",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "", // <- now included
    heightFeet: "",
    heightInches: "",
    weight: "",
    weightUnit: "kg",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const getFlagEmoji = (isoCode) => {
    if (!isoCode) return "";
    try {
      const codePoints = isoCode
        .toUpperCase()
        .split("")
        .map((c) => 127397 + c.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return "";
    }
  };

  const formatPhone = (digits) => {
    const d = digits.replace(/\D/g, "").slice(0, 10);
    if (d.length === 0) return "";
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`;
    return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const formatted = formatPhone(digits);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const phoneDigits = (formData.phone || "").replace(/\D/g, "");

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !phoneDigits ||
      !formData.heightFeet ||
      !formData.heightInches ||
      !formData.weight ||
      !formData.gender // <- check gender is selected
    ) {
      setMessage("❌ Please fill in all required fields");
      setMessageType("error");
      setLoading(false);
      return;
    }

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

    const totalInches =
      parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches);
    const heightInCm = Math.round(totalInches * 2.54);

    let weightInKg = formData.weight;
    if (formData.weightUnit === "lbs") {
      weightInKg = Math.round(parseFloat(formData.weight) * 0.453592);
    }

    const userData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      gender: formData.gender, // <- send gender
      height: heightInCm,
      weight: weightInKg,
      phone: `${formData.countryCode}${phoneDigits}`,
      phoneFormatted: formData.phone,
    };

    console.log("📤 Sending signup data:", userData);

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

        setFormData({
          username: "",
          email: "",
          countryCode: "+1",
          phone: "",
          password: "",
          confirmPassword: "",
          gender: "",
          heightFeet: "",
          heightInches: "",
          weight: "",
          weightUnit: "kg",
        });

        setTimeout(() => {
          navigate("/login", {
            state: {
              from: "signup",
              message: "You've registered successfully! You can now login.",
            },
          });
        }, 1500);
      } else {
        setMessage("❌ " + (data.message || "Signup failed"));
        setMessageType("error");
        if (data.feedback) {
          setMessage((prev) => prev + "\n" + data.feedback.join("\n"));
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
          <div
            style={{
              ...messageStyle,
              background: messageType === "success" ? "#d4edda" : "#f8d7da",
              color: messageType === "success" ? "#155724" : "#721c24",
              border:
                messageType === "success"
                  ? "1px solid #c3e6cb"
                  : "1px solid #f5c6cb",
            }}
          >
            {message.split("\n").map((line, i) => (
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
              name="username"
              placeholder="Enter your username"
              value={formData.username}
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

          {/* Gender */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              style={selectStyle}
              disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Phone Number</label>
            <div style={phoneRowStyle}>
              <div style={countrySelectInline}>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  style={{ ...selectStyle }}
                  disabled={loading}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.dial_code}>
                      {`${getFlagEmoji(c.code)} ${c.name} (${c.dial_code})`}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                name="phone"
                placeholder="(123)-456-7890"
                value={formData.phone}
                onChange={handlePhoneChange}
                required
                style={phoneInputStyle}
                disabled={loading}
              />
            </div>
          </div>

          {/* Height & Weight */}
          <div style={heightWeightRow}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Height</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  name="heightFeet"
                  value={formData.heightFeet}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                  disabled={loading}
                >
                  <option value="">Feet</option>
                  {[...Array(8)].map((_, i) => {
                    const feet = 4 + i;
                    return (
                      <option key={feet} value={feet}>
                        {feet}
                      </option>
                    );
                  })}
                </select>
                <select
                  name="heightInches"
                  value={formData.heightInches}
                  onChange={handleChange}
                  required
                  style={selectStyle}
                  disabled={loading}
                >
                  <option value="">Inches</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Weight</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  min="1"
                  max="1000"
                  disabled={loading}
                />
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  style={selectStyle}
                  disabled={loading}
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
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
                style={{ ...inputStyle, paddingRight: "45px" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={passwordToggleStyle}
                disabled={loading}
              >
                {showPassword ? "🔓" : "🔒"}
              </button>
            </div>
            <PasswordStrengthMeter password={formData.password} />
          </div>

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
                style={{ ...inputStyle, paddingRight: "45px" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                style={passwordToggleStyle}
                disabled={loading}
              >
                {showConfirmPassword ? "🔓" : "🔒"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
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

// 💅 Styles (use your existing styles)
const containerStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" };
const cardStyle = { background: "white", borderRadius: "15px", padding: "2rem", boxShadow: "0 15px 35px rgba(0,0,0,0.1)", width: "100%", maxWidth: "500px" };
const headerStyle = { textAlign: "center", marginBottom: "1.5rem" };
const logoStyle = { display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" };
const logoIcon = { fontSize: "2rem" };
const logoText = { fontSize: "1.5rem", fontWeight: "700", background: "linear-gradient(135deg, #00695c, #004d40)", WebkitBackgroundClip: "text", color: "transparent" };
const titleStyle = { fontSize: "1.5rem", fontWeight: "600", color: "#2d3748" };
const formStyle = { display: "flex", flexDirection: "column", gap: "1rem" };
const inputGroupStyle = { display: "flex", flexDirection: "column" };
const labelStyle = { fontWeight: "500", color: "#4a5568", fontSize: "0.9rem" };
const inputStyle = { padding: "0.75rem", borderRadius: "8px", border: "2px solid #e2e8f0", fontSize: "0.9rem", outline: "none", width: "100%" };
const passwordContainerStyle = { position: "relative", width: "100%" };
const passwordToggleStyle = { position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" };
const phoneRowStyle = { display: "flex", gap: "0.5rem", alignItems: "center" };
const countrySelectInline = { position: "relative", width: "80px" };
const selectStyle = { width: "100%", borderRadius: "8px", border: "2px solid #e2e8f0", padding: "0.75rem" };
const phoneInputStyle = { flex: 1, border: "2px solid #e2e8f0", borderRadius: "8px", padding: "0.75rem" };
const heightWeightRow = { display: "flex", gap: "1rem", marginTop: "0.5rem" };
const buttonStyle = { padding: "0.875rem 2rem", background: "linear-gradient(135deg, #00695c, #004d40)", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "600" };
const footerStyle = { textAlign: "center", marginTop: "1.5rem" };
const footerTextStyle = { color: "#718096" };
const linkStyle = { color: "#00695c", textDecoration: "none", fontWeight: "600" };
const messageStyle = { padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem" };

export default SignupForm;
