const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");
const os = require("os");
const User = require("./models/User"); // ADD THIS LINE

const app = express();

// Function to get your computer's local IP address
const getLocalIP = () => {
  const networkInterfaces = os.networkInterfaces();
  
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        // Check if it's a local network IP (common patterns)
        if (iface.address.startsWith('192.168.') || 
            iface.address.startsWith('10.0.') || 
            iface.address.startsWith('172.')) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost'; // Fallback
};

const LOCAL_IP = getLocalIP();
console.log('📡 Detected local IP address:', LOCAL_IP);

// Initialize test users for in-memory storage
console.log('🔄 Initializing in-memory storage...');
User.initializeTestUsers(); // ADD THIS LINE

// Configure CORS to allow all connections
app.use(cors({
  origin: "*", // Allowing all domains
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
    localUrl: `http://localhost:4000`,
    mobileUrl: `http://${LOCAL_IP}:4000`,
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

const PORT = 4000;

// Listen on all network interfaces (0.0.0.0 means accept connections from any IP)
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(50));
  console.log(`💻 Local access: http://localhost:${PORT}`);
  console.log(`📱 Mobile access: http://${LOCAL_IP}:${PORT}`);
  console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
  console.log('='.repeat(50));
  console.log('🧠 Using IN-MEMORY storage');
  console.log('📊 Test user: test@test.com / Test123!');
  console.log('='.repeat(50));
});

module.exports = app;