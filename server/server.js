require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

// ================================================
// 🔧 ENVIRONMENT VARIABLE DEBUGGING
// ================================================
console.log("=".repeat(50));
console.log("🔧 ENVIRONMENT CONFIGURATION");
console.log("=".repeat(50));
console.log("✅ PORT:", process.env.PORT || "Not set (using default: 4000)");
console.log("✅ NODE_ENV:", process.env.NODE_ENV || "Not set (using default: development)");
console.log("✅ DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Missing");
console.log("✅ JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");
console.log("✅ CORS_ORIGIN:", process.env.CORS_ORIGIN || "Not set (using default: *)");
console.log("=".repeat(50));

// ================================================
// ✅ CORS CONFIGURATION (support multiple origins)
// ================================================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["*"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// ================================================
// ✅ DATABASE CONNECTION TEST
// ================================================
const { Pool } = require('pg');

const testPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testDatabaseConnection() {
  try {
    const client = await testPool.connect();
    console.log('✅ PostgreSQL connection successful');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database time:', result.rows[0].current_time);

    const usersResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (usersResult.rows[0].exists) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log('✅ Users table exists with', userCount.rows[0].count, 'users');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+1',
        ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
        ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
      `);
    } else {
      console.log('⚠️ Users table does not exist yet');
    }

    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
  }
}

testDatabaseConnection();

// ================================================
// ✅ AUTH & USER ROUTES
// ================================================
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, phone, password, gender, height, weight } = req.body;

    console.log("📝 Signup request with username:", username, "email:", email, "phone:", phone);

    if (!email || !password || !phone || !username) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and phone are required'
      });
    }

    const User = require('./models/User');
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.addUser(username, email, phone, hashedPassword, gender, height, weight);

    console.log("✅ User created:", user.username, user.email);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ success: false, message: 'Error creating user account' });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const User = require('./models/User');
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ================================================
// ✅ OTHER ROUTES (unchanged)
// ================================================
app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Healthcare+ Authentication API Server is running!",
  });
});

app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ================================================
// ✅ SERVER START
// ================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`);
  console.log("=".repeat(50));
});

module.exports = app;
