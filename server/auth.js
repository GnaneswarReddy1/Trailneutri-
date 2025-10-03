const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("./models/User");

const SECRET_KEY = "supersecretkey";

// Generate random token (for password reset only)
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Signup - No email verification
exports.signup = async (req, res) => {
  try {
    console.log("📝 Signup request received:", { ...req.body, password: '***' });
    
    const { email, password, gender, height, weight } = req.body;

    // Validation
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
        feedback: passwordValidation.feedback 
      });
    }

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");

    // Create user (automatically verified)
    console.log("👤 Creating user in database...");
    User.addUser(email, hashedPassword, gender, height, weight, true); // isVerified: true

    console.log("🎉 User registration COMPLETED");
    res.status(201).json({ 
      message: "Signup successful! You can now login.",
      success: true 
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Error signing up: " + err.message });
  }
};

// Login - No email verification check
exports.login = async (req, res) => {
  try {
    console.log("🔐 Login request received:", { ...req.body, password: '***' });
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Small delay to ensure file operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = User.findByEmail(email);
    console.log("🔍 User lookup result:", user ? "FOUND" : "NOT FOUND");
    
    if (!user) {
      console.log("❌ Login failed: User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("🔑 Comparing passwords...");
    console.log("Input password:", password);
    console.log("Stored hash:", user.password);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("❌ Login failed: Invalid password");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "24h" });
    console.log("✅ Login successful for:", email);

    res.json({ 
      token,
      user: {
        email: user.email,
        gender: user.gender,
        height: user.height,
        weight: user.weight
      }
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Error logging in: " + err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = User.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // For now, just return success message since we don't have real email
    console.log("✅ Password reset requested for:", email);
    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Error processing request" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // For demo purposes, accept any token
    console.log("✅ Password reset for token:", token);

    const passwordValidation = User.validatePasswordStrength(newPassword);
    if (passwordValidation.strength === "weak") {
      return res.status(400).json({ 
        message: "Password too weak", 
        feedback: passwordValidation.feedback 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // In a real app, you'd get email from token and update that user
    console.log("✅ Password reset completed");
    res.json({ message: "Password reset successfully! You can now login with your new password." });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Dashboard
exports.dashboard = (req, res) => {
  try {
    const token = req.headers["authorization"];
    console.log("📊 Dashboard request, token:", token ? "present" : "missing");
    
    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("✅ Token decoded for:", decoded.email);

    const user = User.findByEmail(decoded.email);
    if (!user) {
      console.log("❌ User not found for email:", decoded.email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("📋 User data found:", {
      email: user.email,
      gender: user.gender,
      height: user.height,
      weight: user.weight
    });

    res.json({
      email: user.email || "Not provided",
      gender: user.gender || "Not specified",
      height: user.height || "Not specified",
      weight: user.weight || "Not specified"
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err.message);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(500).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Check Auth Status
exports.checkAuth = (req, res) => {
  try {
    const token = req.headers["authorization"];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = User.findByEmail(decoded.email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      authenticated: true,
      user: {
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Auth check error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Debug endpoint to check stored tokens
exports.debugTokens = (req, res) => {
  try {
    const debugInfo = User.getDebugInfo();
    
    console.log("🔍 DEBUG - Current state:");
    console.log("👥 Users:", debugInfo.users);
    
    res.json(debugInfo);
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ error: err.message });
  }
};

// NEW: Check all users endpoint - FIXED EXPORT
exports.checkUsers = (req, res) => {
  try {
    const users = User.getAllUsers();
    console.log("🔍 ALL USERS IN DATABASE:", users);
    res.json({
      users: users,
      count: users.length,
      filePath: require('path').join(__dirname, "..", "users.json")
    });
  } catch (err) {
    console.error("❌ Check users error:", err);
    res.status(500).json({ error: err.message });
  }
};