const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");
const User = require("./models/User");

const app = express();

// Initialize test users for in-memory storage
console.log('🔄 Initializing in-memory storage...');
User.initializeTestUsers();

// Configure CORS to allow all connections
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Prefix all routes with /api
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,
    message: "Using in-memory storage - data persists until server restart"
  });
});

// Debug endpoint to check current users
app.get("/debug-users", (req, res) => {
  const debugInfo = User.getDebugInfo();
  res.json({
    users: debugInfo.users,
    userCount: debugInfo.userCount,
    resetTokenCount: debugInfo.resetTokenCount
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Authentication API Server is running!",
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: "/health",
      signup: "/api/signup",
      login: "/api/login",
      dashboard: "/api/dashboard",
      debug: "/debug-users"
    }
  });
});

// All other API routes
app.post("/api/signup", (req, res) => {
  res.json({ message: "Signup endpoint - check routes.js" });
});

app.post("/api/login", (req, res) => {
  res.json({ message: "Login endpoint - check routes.js" });
});

app.get("/api/dashboard", (req, res) => {
  res.json({ message: "Dashboard endpoint - check routes.js" });
});

// ✅ FIX: Use environment variable for port (Render uses port 10000)
const PORT = process.env.PORT || 4000;

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'All origins allowed'}`);
  console.log('='.repeat(50));
  console.log('🧠 Using IN-MEMORY storage');
  console.log('📊 Test user: test@test.com / Test123!');
  console.log('='.repeat(50));
});

module.exports = app;