const { Pool } = require("pg");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create table if not exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        gender VARCHAR(50),
        height VARCHAR(50),
        weight VARCHAR(50),
        country_code VARCHAR(10) DEFAULT '+1',
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        is_verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ PostgreSQL users table ready");

    // Check if phone column exists, if not add it
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50)
      `);
      console.log("✅ Phone column verified/added");
    } catch (alterError) {
      console.log("✅ Phone column already exists");
    }

  } catch (err) {
    console.error("❌ Error creating users table:", err);
  }
})();

// Find user by email
exports.findByEmail = async (email) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error finding user by email:", err);
    throw err;
  }
};

// Find user by email and phone
exports.findByEmailAndPhone = async (email, phoneNumber) => {
  try {
    // Remove any formatting from phone number for comparison
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    console.log("🔍 Searching user with email:", email, "and phone:", cleanPhone);
    
    const query = `
      SELECT * FROM users 
      WHERE email = $1 
      AND REPLACE(COALESCE(phone, ''), '-', '') LIKE $2
    `;
    
    const result = await pool.query(query, [email, `%${cleanPhone}%`]);
    console.log("📊 Found users:", result.rows.length);
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error finding user by email and phone:", err);
    throw err;
  }
};

// Find user by reset token
exports.findByResetToken = async (token) => {
  try {
    const query = `
      SELECT * FROM users 
      WHERE reset_password_token = $1 
      AND reset_password_expires > NOW()
    `;
    
    const result = await pool.query(query, [token]);
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error finding user by reset token:", err);
    throw err;
  }
};

// Update reset token
exports.updateResetToken = async (email, token, expires) => {
  try {
    const query = `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = $2 
      WHERE email = $3
    `;
    
    await pool.query(query, [token, expires, email]);
  } catch (err) {
    console.error("❌ Error updating reset token:", err);
    throw err;
  }
};

// Update password
exports.updatePassword = async (email, hashedPassword) => {
  try {
    const query = `
      UPDATE users 
      SET password = $1, 
          reset_password_token = NULL, 
          reset_password_expires = NULL
      WHERE email = $2
    `;
    
    await pool.query(query, [hashedPassword, email]);
  } catch (err) {
    console.error("❌ Error updating password:", err);
    throw err;
  }
};

// Add user with phone number - FIXED VERSION
exports.addUser = async (username, email, phone, password, gender, height, weight, isVerified = true) => {
  try {
    console.log("📝 Adding user with data:", {
      username, email, phone, gender, height, weight, isVerified
    });
    
    // Ensure empty strings are converted to NULL for database
    const cleanGender = gender && gender !== "" ? gender : null;
    const cleanHeight = height && height !== "" ? height.toString() : null;
    const cleanWeight = weight && weight !== "" ? weight.toString() : null;
    
    const result = await pool.query(
      `INSERT INTO users (username, email, phone, password, gender, height, weight, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [username, email, phone, password, cleanGender, cleanHeight, cleanWeight, isVerified]
    );
    
    console.log("✅ User added successfully with ID:", result.rows[0].id);
    console.log("📊 Saved user data:", {
      id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      gender: result.rows[0].gender,
      height: result.rows[0].height,
      weight: result.rows[0].weight
    });
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error adding user:", err);
    throw err;
  }
};

// Update user phone number
exports.updateUserPhone = async (email, phone) => {
  try {
    const result = await pool.query(
      `UPDATE users SET phone = $1 WHERE email = $2 RETURNING *`,
      [phone, email]
    );
    return result.rows[0];
  } catch (err) {
    console.error("❌ Error updating user phone:", err);
    throw err;
  }
};

// Get all users with phone numbers
exports.getAllUsers = async () => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, phone, gender, height, weight, country_code, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (err) {
    console.error("❌ Error getting all users:", err);
    throw err;
  }
};

// Debug: Check table structure
exports.getTableStructure = async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    return result.rows;
  } catch (err) {
    console.error("❌ Error getting table structure:", err);
    throw err;
  }
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