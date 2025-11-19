// backend/models/user.model.js

// Import mongoose library
const mongoose = require("mongoose");

// 1) Define the schema (structure) for a User document
const userSchema = new mongoose.Schema(
  {
    // Name of the user (required string)
    name: {
      type: String,  
      required: true,
      trim: true,
    },

    // Email of the user (required, must be unique)
    email: {
      type: String,
      required: true,
      unique: true,   // no two users can have same email
      lowercase: true, // always store in lowercase
      trim: true,
    },

    // Password (for now plain text – we will fix this later)
    password: {
      type: String,
      required: true,
      minlength: 6,   // at least 6 characters
    },
  },
  {
    // 2) Schema options: adds createdAt and updatedAt automatically
    timestamps: true,
  }
);

// 3) Create a Model based on the schema
// "User" is the model name; MongoDB collection will be "users"
const User = mongoose.model("User", userSchema);

// 4) Export the Model so other files can use it
module.exports = User;