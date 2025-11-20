// backend/models/application.model.js

const mongoose = require("mongoose");

// 1) Define the Application schema
const applicationSchema = new mongoose.Schema(
  {
    // Reference to the user who created this application
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    position: {
      type: String,
      required: true,
      trim: true,
    },

    jobLink: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "applied",
        "online_assessment",
        "interview",
        "offer",
        "rejected",
        "wishlist"
      ],
      default: "applied",
    },

    appliedDate: {
      type: Date,
      default: Date.now,
    },

    deadline: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// 2) Create Model
const Application = mongoose.model("Application", applicationSchema);

// 3) Export Model
module.exports = Application;