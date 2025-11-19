// Import required packages
const express = require("express");   // main web framework
const cors = require("cors");         // allows frontend to call backend
const morgan = require("morgan");     // logs HTTP requests
const mongoose = require("mongoose"); // MongoDB connection and models
require("dotenv").config();           // loads variables from .env

const User = require("./models/user.model"); // Import User model

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

// Create a new user (DEBUG ONLY, plain-text password for now)
app.post("/api/debug/create-user", async (req, res) => {
  try {
    // Pull data from request body
    const { name, email, password } = req.body;

    // Basic validation: check required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }

    // Use the User model to create a new document in MongoDB
    const newUser = await User.create({
      name,
      email,
      password, // NOTE: plain text, we will change this later
    });

    // Return the created user document
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error.message);

    // Duplicate email error from MongoDB
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Generic server error
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all users (DEBUG ONLY)
app.get("/api/debug/users", async (req, res) => {
  try {
    // Find all users in the collection
    const users = await User.find();

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