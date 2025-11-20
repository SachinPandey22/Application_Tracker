// Import required packages
const express = require("express");   // main web framework
const cors = require("cors");         // allows frontend to call backend
const morgan = require("morgan");     // logs HTTP requests
const mongoose = require("mongoose"); // MongoDB connection and models
require("dotenv").config();           // loads variables from .env

const User = require("./models/user.model"); // Import User model
const bcrypt = require("bcrypt");         // for password hashing
const jwt = require("jsonwebtoken");     // for generating JWT tokens
const Application = require("./models/application.model");
const requireAuth = require("./middleware/auth.middleware");
const app = express();                     // create Express app

// Read PORT and MONGO_URI from environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;


// ====== MIDDLEWARE SETUP ====== //

// Enable CORS so browser can call this API from a different origin (like React on port 3000)
app.use(cors());
// Parse incoming JSON request bodies into req.body
app.use(express.json());
// Log each HTTP request (method, URL, status code, time)
app.use(morgan("dev"));


function generateToken(userId) {
  const payload = { userId };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); 
  return token;}
// ====== TEST ROUTE ====== //

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ApplyTrackr backend is running",
  });
});

//Auth Routes

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation: check required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create the user with the hashed password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken(newUser._id);
    
    // Remove password before sending user back
    const userWithoutPassword = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
    
    return res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Error registering user:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});


//Login Route

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation: check required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password before sending user back
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});


// Create a new application (protected)
app.post("/api/applications", requireAuth, async (req, res) => {
  try {
    const { company, position, jobLink, status, appliedDate, deadline, notes } = req.body;

    if (!company || !position) {
      return res.status(400).json({ message: "company and position are required" });
    }

    const newApp = await Application.create({
      user: req.userId,     // taken from token
      company,
      position,
      jobLink,
      status,
      appliedDate,
      deadline,
      notes,
    });

    return res.status(201).json(newApp);
  } catch (error) {
    console.error("Error creating application:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all applications for logged-in user
app.get("/api/applications", requireAuth, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.userId });

    return res.json(apps);
  } catch (error) {
    console.error("Error fetching applications:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update an application
app.put("/api/applications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Only update the application if it belongs to the logged-in user
    const app = await Application.findOneAndUpdate(
      { _id: id, user: req.userId },
      req.body,
      { new: true } // return updated doc
    );

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json(app);
  } catch (error) {
    console.error("Error updating application:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete an application
app.delete("/api/applications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Application.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json({ message: "Application deleted" });
  } catch (error) {
    console.error("Error deleting application:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// // ====== DEBUG ROUTES (TEMPORARY FOR LEARNING) ====== //

// // Create a new user (DEBUG ONLY, but now with hashed password)
// app.post("/api/debug/create-user", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Basic validation: check required fields
//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: "name, email, and password are required" });
//     }

// //     // Check if a user with this email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: "Email already exists" });
//     }

//     // 1) Hash the password using bcrypt
//     // bcrypt.hash(plainPassword, saltRounds) -> returns hashed string
//     const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

//     // 2) Create the user with the hashed password
//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     // 3) Remove password before sending user back (even though it's hashed)
//     const userWithoutPassword = {
//       _id: newUser._id,
//       name: newUser.name,
//       email: newUser.email,
//       createdAt: newUser.createdAt,
//       updatedAt: newUser.updatedAt,
//     };

//     return res.status(201).json(userWithoutPassword);
//   } catch (error) {
//     console.error("Error creating user:", error.message);

//     return res.status(500).json({ message: "Server error" });
//   }
// });

// // Get all users (DEBUG ONLY)
// app.get("/api/debug/users", async (req, res) => {
//   try {
//     // Find all users in the collection
//     const users = await User.find().select("-password"); // exclude password field

//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: "No users found" });
//     }

//     // Send them back as JSON
//     return res.json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error.message);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

app.get("/api/users", async (req, res) => {
  const users = await User.find().select("-password"); // exclude password field
  return res.json(users);});
// ====== DATABASE CONNECTION & SERVER START ====== //

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
      console.log(`🚀 Server is running on port: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1); // stop the app if DB connection fails
  });