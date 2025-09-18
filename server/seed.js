// seed.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./src/config/db.js";
import User from "./src/models/User.js";
import Complaint from "./src/models/Complaint.js";

async function run() {
  await connectToDatabase();

  const adminEmail = "admin@digitalcomplaintwall.com";
  const studentEmail = "student@digitalcomplaintwall.com";

  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const studentPasswordHash = await bcrypt.hash("student123", 12);

  // Create or update admin
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { name: "Admin User", email: adminEmail, password: adminPasswordHash, role: "admin" },
    { new: true, upsert: true }
  );

  // Create or update student
  const student = await User.findOneAndUpdate(
    { email: studentEmail },
    { name: "John Student", email: studentEmail, password: studentPasswordHash, role: "student" },
    { new: true, upsert: true }
  );

  // Clear existing complaints
  await Complaint.deleteMany({});

  // Function to generate complaint number
  const generateComplaintNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `DCW-${timestamp}-${random}`.toUpperCase();
  };

  // Sample complaints
  const sampleComplaints = [
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: "Hostel",
      description: "Water leakage in bathroom of Room 205, Block A. Ceiling is dripping water.",
      priority: "High",
      status: "Open",
      contactEmail: studentEmail
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: "Mess",
      description: "Food quality is poor. Rice undercooked, vegetables stale.",
      priority: "Medium",
      status: "Under Review",
      contactEmail: studentEmail
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: "Internet",
      description: "WiFi slow in library. Cannot access online resources.",
      priority: "Medium",
      status: "Resolved",
      adminNote: "New routers installed. Speed improved.",
      contactEmail: studentEmail
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: "Classroom",
      description: "Projector in Room 101 not working. Images blurry.",
      priority: "High",
      status: "Open",
      contactEmail: studentEmail
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: "Library",
      description: "Air conditioning not working. Gets hot in afternoon.",
      priority: "Low",
      status: "Open",
      contactEmail: studentEmail
    }
  ];

  await Complaint.insertMany(sampleComplaints);

  console.log("✅ Seed data created successfully!");
  console.log("📧 Admin Login:", { email: adminEmail, password: "admin123" });
  console.log("👨‍🎓 Student Login:", { email: studentEmail, password: "student123" });
  console.log("📊 Created", sampleComplaints.length, "sample complaints");

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
