// Import required packages
const express = require("express");  // main web framework
const cors = require("cors");        // allows frontend to call backend
const morgan = require("morgan");    // logs HTTP requests
require("dotenv").config();          // loads variables from .env

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

// When someone sends GET request to /api/health, run this function
app.get("/api/health", (req, res) => {
  // Send a JSON response
  res.json({
    status: "ok",
    message: "ApplyTrackr backend is running"
  });
});

// ====== START SERVER ====== //

// Read PORT value from environment variables, default to 5000 if not set
const PORT = process.env.PORT || 5000;

// Start the server and listen on PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});