// routes/application.routes.js

const express = require("express");

const Application = require("../models/application.model");
const requireAuth = require("../middleware/auth.middleware");

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(requireAuth);

// Create a new application
router.post("/", async (req, res) => {
  try {
    const { company, position, jobLink, status, appliedDate, deadline, notes } =
      req.body;

    if (!company || !position) {
      return res
        .status(400)
        .json({ message: "company and position are required" });
    }

    const newApp = await Application.create({
      user: req.userId, // from auth middleware
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

// Get all applications for logged-in user, with optional filters & sorting
router.get("/", async (req, res) => {
  try {
    const { status, sortBy, order } = req.query;

    const query = { user: req.userId };

    if (status) {
      query.status = status;
    }

    let sortOption = { createdAt: -1 }; // default: newest first

    if (sortBy) {
      const sortField = sortBy;
      const sortOrder = order === "asc" ? 1 : -1;
      sortOption = { [sortField]: sortOrder };
    }

    const apps = await Application.find(query).sort(sortOption);

    return res.json(apps);
  } catch (error) {
    console.error("Error fetching applications:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update an application
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const app = await Application.findOneAndUpdate(
      { _id: id, user: req.userId }, // ensures user owns this app
      req.body,
      { new: true }
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
router.delete("/:id", async (req, res) => {
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

module.exports = router;