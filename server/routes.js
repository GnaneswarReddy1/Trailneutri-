const express = require("express");
const { 
  login, 
  signup, 
  dashboard, 
  forgotPassword,
  resetPassword,
  checkAuth,
  debugTokens,
  checkUsers
} = require("./auth");
const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/dashboard", dashboard);
router.get("/check-auth", checkAuth);

// Debug routes
router.get("/debug-tokens", debugTokens);
router.get("/check-users", checkUsers);

module.exports = router;