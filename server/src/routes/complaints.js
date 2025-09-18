// src/routes/complaints.js
import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// Get all complaints (admin only)
router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new complaint (authenticated users)
router.post("/add", authenticate, async (req, res) => {
  try {
    const complaint = new Complaint({
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
    });

    await complaint.save();
    res.status(201).json({ message: "Complaint added successfully", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a complaint (admin only)
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a complaint (admin only)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;




