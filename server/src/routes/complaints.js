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

// Add a complaint (authenticated users)
router.post("/add", authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.create({
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
    });
    res.status(201).json({ message: "Complaint added", complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint (admin only)
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete complaint (admin only)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;




