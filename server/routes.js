const express = require("express");
const { 
  login, 
  signup, 
  dashboard, 
  forgotPassword,
  resetPassword,
  checkAuth,
  debugTokens,
  checkUsers  // ADD THIS
} = require("./auth");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/dashboard", dashboard);
router.get("/check-auth", checkAuth);
router.get("/debug-tokens", debugTokens);
router.get("/check-users", checkUsers);  // ADD THIS LINE

module.exports = router;