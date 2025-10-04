const { Pool } = require("pg");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Create table if not exists
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      gender VARCHAR(50),
      height VARCHAR(50),
      weight VARCHAR(50),
      is_verified BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ PostgreSQL users table ready");
})();

// Find user by email
exports.findByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

// Add user
exports.addUser = async (email, password, gender, height, weight, isVerified = true) => {
  const result = await pool.query(
    `INSERT INTO users (email, password, gender, height, weight, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [email, password, gender, height, weight, isVerified]
  );
  return result.rows[0];
};

// Update user
exports.updateUser = async (email, updates) => {
  const fields = [];
  const values = [];
  let i = 1;

  for (let key in updates) {
    fields.push(`${key} = $${i}`);
    values.push(updates[key]);
    i++;
  }

  values.push(email);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE email = $${i} RETURNING *`,
    values
  );
  return result.rows[0];
};

// Helpers
exports.isValidEmail = (email) => validator.isEmail(email);

exports.validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  let score = 0;
  let feedback = [];

  if (password.length >= minLength) score++;
  else feedback.push(`Password should be at least ${minLength} characters long`);

  if (hasUpperCase) score++;
  else feedback.push("Include at least one uppercase letter");

  if (hasLowerCase) score++;
  else feedback.push("Include at least one lowercase letter");

  if (hasNumbers) score++;
  else feedback.push("Include at least one number");

  if (hasSpecialChar) score++;
  else feedback.push("Include at least one special character");

  let strength;
  if (score >= 4) strength = "strong";
  else if (score >= 3) strength = "medium";
  else strength = "weak";

  return { score, strength, feedback };
};
