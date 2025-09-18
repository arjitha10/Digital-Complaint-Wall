// src/routes/complaints.js
import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import Complaint from "../models/Complaint.js";

const router = express.Router();

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  const complaints = await Complaint.find();
  res.json(complaints);
});

router.post("/add", authenticate, async (req, res) => {
  const complaint = await Complaint.create({
    studentId: req.user.id,
    ...req.body,
  });
  res.status(201).json(complaint);
});

router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  const deleted = await Complaint.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted successfully" });
});

export default router;


