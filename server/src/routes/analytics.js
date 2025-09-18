import express from "express";
import Complaint from "../models/Complaint.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: "pending" });
    const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" });

    res.json({
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;


