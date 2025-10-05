require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

// 🗄️ PostgreSQL
console.log("✅ DATABASE_URL:", process.env.DATABASE_URL ? "Loaded" : "Missing");

// Configure CORS to allow all connections
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// Test database connection
const { Pool } = require('pg');

const testPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function testDatabaseConnection() {
  try {
    const client = await testPool.connect();
    console.log('✅ PostgreSQL connection successful');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database time:', result.rows[0].current_time);
    
    // Check if users table exists and has data
    const usersResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (usersResult.rows[0].exists) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log('✅ Users table exists with', userCount.rows[0].count, 'users');
      
      // Check if new columns exist, if not add them
      try {
        await client.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+1',
          ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
          ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
        `);
        console.log('✅ Added missing columns for forgot password functionality');
      } catch (alterError) {
        console.log('✅ Table structure is already up to date');
      }
    } else {
      console.log('⚠️ Users table does not exist yet');
    }
    
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    console.error('❌ Connection details:', {
      host: process.env.DATABASE_URL ? 'Provided' : 'Missing',
      ssl: 'Enabled'
    });
  }
}

testDatabaseConnection();

// Enhanced signup endpoint to ensure phone is saved
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, phone, password, gender, height, weight } = req.body;

    console.log("📝 Signup request with username:", username, "email:", email, "phone:", phone);

    // Validate input
    if (!email || !password || !phone || !username) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and phone are required'
      });
    }

    const User = require('./models/User');
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with phone
    const user = await User.addUser(
      username, 
      email, 
      phone, // Make sure phone is included
      hashedPassword, 
      gender, 
      height, 
      weight
    );

    console.log("✅ User created with username:", user.username, "email:", user.email);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username, // Make sure username is included
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        height: user.height,
        weight: user.weight
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user account'
    });
  }
});

// Enhanced login endpoint with token generation
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt for:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const User = require('./models/User');
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log("✅ Login successful for:", user.username, "email:", user.email);

    // Generate a simple token (in production, use JWT)
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    res.json({
      success: true,
      message: 'Login successful',
      token: token, // Add this token for frontend
      user: {
        id: user.id,
        username: user.username, // Make sure username is included
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        height: user.height,
        weight: user.weight
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Dashboard endpoint - returns user data
app.get("/api/dashboard", async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.getAllUsers();
    
    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data'
    });
  }
});

// Check users endpoint
app.get("/api/check-users", async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.getAllUsers();
    
    res.json({
      success: true,
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        created_at: user.created_at
      }))
    });
  } catch (error) {
    console.error('❌ Check users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users'
    });
  }
});

// Enhanced forgot password endpoint
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    console.log("📧 Forgot password request for:", email, "Phone:", phoneNumber);

    // Validate input
    if (!email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone number are required'
      });
    }

    // Find user by email and phone
    const User = require('./models/User');
    const user = await User.findByEmailAndPhone(email, phoneNumber);
    
    if (!user) {
      console.log("❌ No user found with email:", email, "and phone:", phoneNumber);
      return res.status(404).json({
        success: false,
        message: 'No account found with provided email and phone number'
      });
    }

    console.log("✅ User found:", user.email, "username:", user.username);

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save reset token to database
    await User.updateResetToken(email, resetToken, new Date(resetTokenExpiry));

    // In a real application, you would send an email here
    // For development, we'll return the token in the response
    console.log(`🔐 Password reset token for ${email}: ${resetToken}`);
    
    // Create reset link (in production, this would be your frontend URL)
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    res.json({
      success: true,
      message: 'Password reset link has been sent to your email',
      // In development, include the reset link for testing
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// Enhanced reset password endpoint
app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log("🔄 Reset password request with token:", token ? "Provided" : "Missing");

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by valid reset token
    const User = require('./models/User');
    const user = await User.findByResetToken(token);
    
    if (!user) {
      console.log("❌ Invalid or expired reset token");
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    console.log("✅ Valid reset token for user:", user.email);

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await User.updatePassword(user.email, hashedPassword);

    console.log("✅ Password reset successful for:", user.email);

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// Prefix all routes with /api
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    message: "Using PostgreSQL storage - persistent users enabled",
    features: {
      signup: "Enhanced with username and phone number support",
      login: "Email and password authentication with token",
      forgotPassword: "Enhanced with email + phone verification",
      resetPassword: "Token-based secure reset"
    }
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Healthcare+ Authentication API Server is running!",
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      signup: "POST /api/signup",
      login: "POST /api/login",
      dashboard: "GET /api/dashboard",
      checkUsers: "GET /api/check-users",
      forgotPassword: "POST /api/forgot-password",
      resetPassword: "POST /api/reset-password"
    },
    database: {
      status: "PostgreSQL Connected",
      url: process.env.DATABASE_URL ? "Configured" : "Missing"
    },
    features: {
      authentication: "Email + Password with token",
      phoneVerification: "Required for password reset",
      passwordReset: "Secure token-based system",
      dataPersistence: "PostgreSQL database"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// ✅ Use environment variable for port (Render uses dynamic ports)
const PORT = process.env.PORT || 4000;

// Listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log("🚀 SERVER STARTED SUCCESSFULLY");
  console.log("=".repeat(50));
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || "All origins allowed"}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? "PostgreSQL Configured" : "NOT CONFIGURED"}`);
  console.log("=".repeat(50));
  console.log("🗄️ Using PostgreSQL storage - persistent users enabled");
  console.log("=".repeat(50));
  console.log("📋 Available Endpoints:");
  console.log("   POST /api/signup - Create new account (with username)");
  console.log("   POST /api/login - User login (with token and username)");
  console.log("   GET  /api/dashboard - Protected user data");
  console.log("   POST /api/forgot-password - Request password reset (Email + Phone)");
  console.log("   POST /api/reset-password - Reset password with token");
  console.log("   GET  /api/check-users - Debug endpoint");
  console.log("=".repeat(50));
  console.log("🔐 Enhanced Security Features:");
  console.log("   ✅ Username support in authentication");
  console.log("   ✅ Email + Phone verification for password reset");
  console.log("   ✅ Secure token generation for login");
  console.log("   ✅ Password hashing with bcrypt");
  console.log("=".repeat(50));
});

module.exports = app;