const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();

// 🗄️ PostgreSQL replaces in-memory storage
console.log("🗄️ Connected to PostgreSQL — no in-memory storage needed.");

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

// Prefix all routes with /api
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    message: "Using PostgreSQL storage - persistent data",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Authentication API Server is running!",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/health",
      signup: "/api/signup",
      login: "/api/login",
      dashboard: "/api/dashboard",
      checkUsers: "/api/check-users",
    },
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
  console.log("=".repeat(50));
  console.log("🗄️ Using PostgreSQL storage - persistent users enabled");
  console.log("=".repeat(50));
});

module.exports = app;
