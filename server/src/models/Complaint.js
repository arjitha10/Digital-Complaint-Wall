// src/models/Complaint.js
import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: String,
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: String,
    description: String,
    priority: { type: String, enum: ["Low", "Medium", "High"] },
    status: String,
    adminNote: String,
    contactEmail: String,
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", complaintSchema);
