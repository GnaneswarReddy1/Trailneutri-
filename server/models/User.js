const validator = require('validator');

// In-memory storage (works on Render)
let users = [];
let resetTokens = [];

// User management
exports.findByEmail = (email) => {
  const user = users.find((u) => u && u.email === email);
  console.log(`🔍 User lookup for ${email}:`, user ? "FOUND" : "NOT FOUND");
  return user;
};

exports.addUser = (email, password, gender, height, weight, isVerified = true) => {
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    gender: gender || "Not specified",
    height: height || "Not specified",
    weight: weight || "Not specified",
    isVerified,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  console.log("✅ User added to memory:", email);
  console.log("📊 Total users in memory:", users.length);
  return newUser;
};

exports.updateUser = (email, updates) => {
  const userIndex = users.findIndex((u) => u.email === email);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    console.log("✅ User updated:", email);
    console.log("📋 Updated fields:", updates);
    return users[userIndex];
  } else {
    console.log("❌ User not found for update:", email);
  }
  return null;
};

// Password reset token management
exports.saveResetToken = (email, token) => {
  const filteredTokens = resetTokens.filter((t) => t && t.email !== email);
  filteredTokens.push({ 
    email, 
    token, 
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });
  resetTokens = filteredTokens;
};

exports.getResetToken = (token) => {
  const tokenData = resetTokens.find((t) => t && t.token === token);
  
  if (tokenData) {
    const now = new Date();
    const expiresAt = new Date(tokenData.expiresAt);
    if (now > expiresAt) {
      this.removeResetToken(token);
      return null;
    }
    return tokenData;
  }
  return null;
};

exports.removeResetToken = (token) => {
  resetTokens = resetTokens.filter((t) => t && t.token !== token);
};

// Email validation
exports.isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Password strength validation
exports.validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  let score = 0;
  let feedback = [];
  
  if (password.length >= minLength) score++;
  else feedback.push(`Password should be at least ${minLength} characters long`);
  
  if (hasUpperCase) score++;
  else feedback.push("Include at least one uppercase letter");
  
  if (hasLowerCase) score++;
  else feedback.push("Include at least one lowercase letter");
  
  if (hasNumbers) score++;
  else feedback.push("Include at least one number");
  
  if (hasSpecialChar) score++;
  else feedback.push("Include at least one special character");
  
  let strength;
  if (score >= 4) strength = "strong";
  else if (score >= 3) strength = "medium";
  else strength = "weak";
  
  return { score, strength, feedback };
};

// Debug function to check current state
exports.getDebugInfo = () => {
  return {
    users,
    resetTokens,
    userCount: users.length,
    resetTokenCount: resetTokens.length
  };
};

// New function to check all users
exports.getAllUsers = () => {
  return users;
};

// Add some test users for development
exports.initializeTestUsers = () => {
  // Add a test user if none exist
  if (users.length === 0) {
    users.push({
      id: "test123",
      email: "test@test.com",
      password: "$2a$10$DQ3VULgddjDS2ZuuhGHM6e6YlGz80LjGINBC6x/TEOkYwrPM39Sr2", // Test123!
      gender: "male",
      height: "178",
      weight: "70",
      isVerified: true,
      createdAt: new Date().toISOString()
    });
    console.log("✅ Test user added: test@test.com / Test123!");
  }
};  