// src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

import { connectToDatabase } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/error.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

// Routes
app.get("/", (req, res) => res.type("text/plain").send("Digital Complaint Wall API"));
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(async () => {
    const adminEmail = "admin@digitalcomplaintwall.com";
    const adminPassword = "admin123";

    let admin = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (!admin) {
      admin = await User.create({ name: "Admin", email: adminEmail, password: hashedPassword, role: "admin" });
      console.log("✅ Admin seeded:", adminEmail);
    } else {
      await User.findByIdAndUpdate(admin._id, { password: hashedPassword });
      console.log("✅ Admin password updated:", adminEmail);
    }

    const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}, shutting down...`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 3000).unref();
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

