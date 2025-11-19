// Import required packages
const express = require("express");   // main web framework
const cors = require("cors");         // allows frontend to call backend
const morgan = require("morgan");     // logs HTTP requests
const mongoose = require("mongoose"); // MongoDB connection and models
require("dotenv").config();           // loads variables from .env

const User = require("./models/user.model"); // Import User model
const bcrypt = require("bcrypt");         // for password hashing
// Create an Express app instance
const app = express();

// ====== MIDDLEWARE SETUP ====== //

// Enable CORS so browser can call this API from a different origin (like React on port 3000)
app.use(cors());

// Parse incoming JSON request bodies into req.body
app.use(express.json());

// Log each HTTP request (method, URL, status code, time)
app.use(morgan("dev"));

// ====== TEST ROUTE ====== //

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ApplyTrackr backend is running",
  });
});
// ====== DEBUG ROUTES (TEMPORARY FOR LEARNING) ====== //

// Create a new user (DEBUG ONLY, but now with hashed password)
app.post("/api/debug/create-user", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation: check required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // 1) Hash the password using bcrypt
    // bcrypt.hash(plainPassword, saltRounds) -> returns hashed string
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 2) Create the user with the hashed password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 3) Remove password before sending user back (even though it's hashed)
    const userWithoutPassword = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error.message);

    return res.status(500).json({ message: "Server error" });
  }
});

// Get all users (DEBUG ONLY)
app.get("/api/debug/users", async (req, res) => {
  try {
    // Find all users in the collection
    const users = await User.find().select("-password"); // exclude password field

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Send them back as JSON
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});
// ====== DATABASE CONNECTION & SERVER START ====== //

// Read PORT and MONGO_URI from environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const SALT_ROUNDS = 10;
// Simple check: fail fast if MONGO_URI is missing
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1); // stop the app
}

// Connect to MongoDB using Mongoose
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start the server only after DB connection is successful
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1); // stop the app if DB connection fails
  });