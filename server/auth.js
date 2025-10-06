const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
const TOKEN_EXPIRY = "24h";

const generateJwt = (payload) => jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
const verifyJwt = (token) => jwt.verify(token, SECRET_KEY);

const extractToken = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  if (authHeader.startsWith("Bearer ")) return authHeader.split(" ")[1];
  return authHeader;
};

// =================== SIGNUP ===================
exports.signup = async (req, res) => {
  try {
    const { username, email, phone, password, gender, height, weight } = req.body;

    if (!username || !email || !phone || !password || !gender) {
      return res.status(400).json({ message: "Username, email, phone, password, and gender are required" });
    }

    if (!User.isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordValidation = User.validatePasswordStrength(password);
    if (passwordValidation.strength === "weak") {
      return res.status(400).json({ message: "Password too weak", feedback: passwordValidation.feedback });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: "User already exists with this email" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.addUser(
      username,
      email,
      phone,
      hashedPassword,
      gender || "Not specified", // default if missing
      height || 0,
      weight || 0,
      true
    );

    const token = generateJwt({ id: newUser.id, email: newUser.email });

    res.status(201).json({ message: "Signup successful", token });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =================== LOGIN ===================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = generateJwt({ id: user.id, email: user.email });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { generateJwt, verifyJwt, extractToken, signup: exports.signup, login: exports.login };
