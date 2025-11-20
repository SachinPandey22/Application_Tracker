// Import required packages
const express = require("express");   // main web framework
const cors = require("cors");         // allows frontend to call backend
const morgan = require("morgan");     // logs HTTP requests
const mongoose = require("mongoose"); // MongoDB connection and models
require("dotenv").config();           // loads variables from .env
// Import route handlers
const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");

const app = express();                     // create Express app

// Read PORT and MONGO_URI from environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ====== MIDDLEWARE SETUP ====== //

// Enable CORS so browser can call this API from a different origin (like React on port 3000)
app.use(cors());
// Parse incoming JSON request bodies into req.body
app.use(express.json());
// Log each HTTP request (method, URL, status code, time)
app.use(morgan("dev"));



// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ApplyTrackr backend is running",
  });
});

// ====== ROUTES SETUP ====== //
app.use("/api/auth", authRoutes);               // Auth routes (register, login)
app.use("/api/applications", applicationRoutes); // Application CRUD routes

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