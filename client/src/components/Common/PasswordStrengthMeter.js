import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (password) => {
    let score = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) score++;
    else feedback.push("At least 8 characters");

    // Upper case check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push("One uppercase letter");

    // Lower case check
    if (/[a-z]/.test(password)) score++;
    else feedback.push("One lowercase letter");

    // Number check
    if (/\d/.test(password)) score++;
    else feedback.push("One number");

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push("One special character");

    let strength = "weak";
    let color = "#e53e3e";
    let width = "20%";

    if (score >= 4) {
      strength = "strong";
      color = "#38a169";
      width = "100%";
    } else if (score >= 3) {
      strength = "medium";
      color = "#d69e2e";
      width = "60%";
    } else if (score >= 2) {
      strength = "fair";
      color = "#ed8936";
      width = "40%";
    }

    return { strength, color, width, feedback, score };
  };

  const { strength, color, width, feedback, score } = calculateStrength(password);

  if (!password) return null;

  return (
    <div style={containerStyle}>
      <div style={meterContainerStyle}>
        <div style={meterBackgroundStyle}>
          <div 
            style={{
              ...meterFillStyle,
              width,
              backgroundColor: color
            }}
          />
        </div>
        <span style={{ ...strengthTextStyle, color }}>
          {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </span>
      </div>
      
      {score < 4 && (
        <div style={feedbackStyle}>
          <p style={feedbackTitleStyle}>Password should contain:</p>
          <ul style={feedbackListStyle}>
            {feedback.map((item, index) => (
              <li key={index} style={feedbackItemStyle}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const containerStyle = {
  marginTop: '0.5rem',
};

const meterContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '0.5rem',
};

const meterBackgroundStyle = {
  flex: 1,
  height: '6px',
  backgroundColor: '#e2e8f0',
  borderRadius: '3px',
  overflow: 'hidden',
};

const meterFillStyle = {
  height: '100%',
  borderRadius: '3px',
  transition: 'all 0.3s ease',
};

const strengthTextStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  minWidth: '50px',
};

const feedbackStyle = {
  backgroundColor: '#f7fafc',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const feedbackTitleStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#4a5568',
  margin: '0 0 0.5rem 0',
};

const feedbackListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const feedbackItemStyle = {
  fontSize: '0.75rem',
  color: '#718096',
  marginBottom: '0.25rem',
};

export default PasswordStrengthMeter;