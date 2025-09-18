import express from "express";
import Complaint from "../models/Complaint.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All complaint routes require authentication
router.use(authenticate);

// POST /api/complaints
router.post("/", async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user.id,
    });
    res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (err) {
    next(err);
  }
});

// GET /api/complaints
router.get("/", async (req, res, next) => {
  try {
    const complaints =
      req.user.role === "admin"
        ? await Complaint.find().populate("createdBy", "name email")
        : await Complaint.find({ createdBy: req.user.id });

    res.json(complaints);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/complaints/:id/status (admin only)
router.patch("/:id/status", requireRole("admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: "Status updated", complaint });
  } catch (err) {
    next(err);
  }
});

export default router;



