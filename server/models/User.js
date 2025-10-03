const fs = require("fs");
const path = require("path");
const validator = require('validator');

const usersFile = path.join(__dirname, "..", "users.json");
const resetTokensFile = path.join(__dirname, "..", "resetTokens.json");

// Helper functions for file management
function readJSONFile(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      const defaultContent = JSON.stringify(defaultData, null, 2);
      fs.writeFileSync(filePath, defaultContent);
      return defaultData;
    }
    
    const data = fs.readFileSync(filePath, "utf-8").trim();
    if (!data) {
      const defaultContent = JSON.stringify(defaultData, null, 2);
      fs.writeFileSync(filePath, defaultContent);
      return defaultData;
    }
    
    const parsed = JSON.parse(data);
    console.log(`📖 Read ${filePath}:`, Array.isArray(parsed) ? `${parsed.length} items` : 'Invalid format');
    return Array.isArray(parsed) ? parsed : defaultData;
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    // Reset the file if it's corrupted
    const defaultContent = JSON.stringify(defaultData, null, 2);
    fs.writeFileSync(filePath, defaultContent);
    return defaultData;
  }
}

function writeJSONFile(filePath, data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content);
    console.log(`💾 Written to ${filePath}:`, Array.isArray(data) ? `${data.length} items` : 'data');
    return true;
  } catch (error) {
    console.error(`❌ Error writing to ${filePath}:`, error.message);
    return false;
  }
}

// User management
exports.findByEmail = (email) => {
  const users = readJSONFile(usersFile);
  const user = users.find((u) => u && u.email === email);
  console.log(`🔍 User lookup for ${email}:`, user ? "FOUND" : "NOT FOUND");
  return user;
};

exports.addUser = (email, password, gender, height, weight, isVerified = true) => {
  const users = readJSONFile(usersFile);
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    gender: gender || "Not specified",
    height: height || "Not specified",
    weight: weight || "Not specified",
    isVerified, // Always true now
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  const success = writeJSONFile(usersFile, users);
  if (success) {
    console.log("✅ User added to database:", email);
  } else {
    console.log("❌ FAILED to add user to database");
  }
  return newUser;
};

exports.updateUser = (email, updates) => {
  const users = readJSONFile(usersFile);
  const userIndex = users.findIndex((u) => u.email === email);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    const success = writeJSONFile(usersFile, users);
    if (success) {
      console.log("✅ User updated:", email);
      console.log("📋 Updated fields:", updates);
      return users[userIndex];
    } else {
      console.log("❌ FAILED to update user");
    }
  } else {
    console.log("❌ User not found for update:", email);
  }
  return null;
};

// Password reset token management (simplified)
exports.saveResetToken = (email, token) => {
  const tokens = readJSONFile(resetTokensFile);
  const filteredTokens = tokens.filter((t) => t && t.email !== email);
  filteredTokens.push({ 
    email, 
    token, 
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });
  writeJSONFile(resetTokensFile, filteredTokens);
};

exports.getResetToken = (token) => {
  const tokens = readJSONFile(resetTokensFile);
  const tokenData = tokens.find((t) => t && t.token === token);
  
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
  const tokens = readJSONFile(resetTokensFile);
  const filteredTokens = tokens.filter((t) => t && t.token !== token);
  writeJSONFile(resetTokensFile, filteredTokens);
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
  const users = readJSONFile(usersFile);
  const resetTokens = readJSONFile(resetTokensFile);
  
  return {
    users,
    resetTokens,
    userCount: users.length,
    resetTokenCount: resetTokens.length
  };
};

// New function to check all users
exports.getAllUsers = () => {
  return readJSONFile(usersFile);
};