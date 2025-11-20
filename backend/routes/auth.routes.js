// routes/auth.routes.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const router = express.Router();

// How strong to hash passwords
const SALT_ROUNDS = 10;

// Read secret key from environment
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in environment variables");
  // We don't exit here because server.js may have already started;
  // but in a real app you'd fail fast.
}

// Helper: generate token
function generateToken(userId) {
  const payload = { userId };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

// ====== REGISTER ====== //

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters long" });
    }

    // Check if email already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Remove password from response
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return res.status(201).json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Error in /api/auth/register:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// ====== LOGIN ====== //

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Error in /api/auth/login:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;