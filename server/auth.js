const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// ===============================
// 🔑 Config
// ===============================
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
const TOKEN_EXPIRY = "24h";

// ===============================
// 🔐 Helper functions
// ===============================

// Generate JWT
const generateJwt = (payload) => jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });

// Verify JWT safely
const verifyJwt = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error("Invalid token");
  }
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
// 📝 Signup
// ===============================
exports.signup = async (req, res) => {
  try {
    const { username, email, phone, password, gender, height, weight } = req.body;
    
    // Validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        message: "Username, email, phone, and password are required"
      });
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

    // Check existing user
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.addUser(Username, email, phone, hashedPassword, gender, height, weight, true);

    res.status(201).json({
  success: true,
  message: "Signup successful! You can now login.",
  user: {
    Username: newUser.username,
    email: newUser.email,
    phone: newUser.phone,
    gender: newUser.gender || "Not specified",
    height: newUser.height || "Not specified",
    weight: newUser.weight || "Not specified",
  },
});
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ 
      message: "Error signing up: " + err.message
    });
  }
};

// ===============================
// 🔐 Login
// ===============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateJwt({ email: user.email, id: user.id });

   res.json({
  success: true,
  message: "Login successful",
  token,
  user: {
    Username: user.username,
    email: user.email,
    phone: user.phone || "Not specified",
    gender: user.gender || "Not specified",
    height: user.height || "Not specified",
    weight: user.weight || "Not specified",
  },
});
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ 
      message: "Error logging in: " + err.message
    });
  }
};

// ===============================
// 📊 Dashboard (Protected Route)
// ===============================
exports.dashboard = async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyJwt(token);
    const user = await User.findByEmail(decoded.email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        Username: user.username,
        email: user.email,
        phone: user.phone || "Not specified",
        gender: user.gender || "Not specified",
        height: user.height || "Not specified",
        weight: user.weight || "Not specified",
      },
      message: "Dashboard data retrieved successfully",
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err.message);
    if (err.name === "JsonWebTokenError" || err.message === "Invalid token") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// ===============================
// 🧠 Check Auth
// ===============================
exports.checkAuth = async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyJwt(token);
    const user = await User.findByEmail(decoded.email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      authenticated: true,
      user: {
        Username: user.username,
        email: user.email,
        phone: user.phone || "Not specified",
        gender: user.gender || "Not specified",
        height: user.height || "Not specified",
        weight: user.weight || "Not specified",
      },
    });
  } catch (err) {
    console.error("❌ Auth check error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ===============================
// 🔁 Forgot Password
// ===============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Error processing request" });
  }
};

// ===============================
// 🔑 Reset Password
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

    res.json({
      message: "Password reset successfully! You can now login with your new password.",
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// ===============================
// 🧩 Debug Endpoints
// ===============================
exports.debugTokens = (req, res) => {
  res.json({ message: "Debug endpoint - server is working" });
};

exports.checkUsers = async (req, res) => {
  try {
    const result = await User.getAllUsers();
    res.json({ users: result, count: result.length });
  } catch (err) {
    console.error("❌ Check users error:", err);
    res.status(500).json({ error: err.message });
  }
};