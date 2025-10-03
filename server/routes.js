const express = require("express");
const { 
  login, 
  signup, 
  dashboard, 
  forgotPassword,
  resetPassword,
  checkAuth,
  debugTokens
  // Remove checkUsers for now to test basic functionality
} = require("./auth");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/dashboard", dashboard);
router.get("/check-auth", checkAuth);
router.get("/debug-tokens", debugTokens);
// Remove this line temporarily: router.get("/check-users", checkUsers);

module.exports = router;