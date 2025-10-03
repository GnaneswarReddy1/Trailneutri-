const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("./models/User");

// ===============================
// 🔑 Config
// ===============================
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey"; // fallback for dev
const TOKEN_EXPIRY = "24h"; // token valid for 24 hours

// ===============================
// 🔐 Helper functions
// ===============================

// Generate JWT
const generateJwt = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
};

// Verify JWT safely
const verifyJwt = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

// Extract token from "Authorization" header
const extractToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return authHeader;
};

// ===============================
// Signup
// ===============================
exports.signup = async (req, res) => {
  try {
    const { email, password, gender, height, weight } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    if (!User.isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordValidation = User.validatePasswordStrength(password);
    if (passwordValidation.strength === "weak") {
      return res.status(400).json({
        message: "Password too weak",
        feedback: passwordValidation.feedback,
      });
    }

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    User.addUser(email, hashedPassword, gender, height, weight, true);

    res.status(201).json({
      message: "Signup successful! You can now login.",
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: "Error signing up: " + err.message });
  }
};

// ===============================
// Login
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateJwt({ email: user.email });

    res.json({
      token,
      user: {
        email: user.email,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in: " + err.message });
  }
};

// ===============================
// Dashboard (protected)
// ===============================
exports.dashboard = (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyJwt(token);

    const user = User.findByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        email: user.email || "Not provided",
        gender: user.gender || "Not specified",
        height: user.height || "Not specified",
        weight: user.weight || "Not specified",
      },
      message: "Dashboard data retrieved successfully",
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ===============================
// Forgot Password
// ===============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = User.findByEmail(email);
    if (!user) {
      // Don’t reveal whether user exists
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    console.log("✅ Password reset requested for:", email);
    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (err) {
    res.status(500).json({ message: "Error processing request" });
  }
};

// ===============================
// Reset Password
// ===============================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const passwordValidation = User.validatePasswordStrength(newPassword);
    if (passwordValidation.strength === "weak") {
      return res.status(400).json({
        message: "Password too weak",
        feedback: passwordValidation.feedback,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("✅ Password reset completed");

    res.json({
      message: "Password reset successfully! You can now login with your new password.",
    });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

// ===============================
// Check Auth
// ===============================
exports.checkAuth = (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyJwt(token);
    const user = User.findByEmail(decoded.email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      authenticated: true,
      user: {
        email: user.email,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ===============================
// Debug Endpoints
// ===============================
exports.debugTokens = (req, res) => {
  try {
    const debugInfo = User.getDebugInfo();
    res.json(debugInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkUsers = (req, res) => {
  try {
    const users = User.getAllUsers();
    res.json({ users, count: users.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
