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
import analyticsRoutes from "./routes/analytics.js";
import filesRoutes from "./routes/files.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/error.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Security & utils
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// Root route
app.get("/", (req, res) => res.type("text/plain").send("Welcome to Digital Complaint Wall API"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/files", filesRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

console.log("Environment variables:");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
console.log("PORT:", PORT);

// Connect to DB and start server
connectToDatabase()
  .then(async () => {
    // Seed admin user if not exists
    const adminEmail = "admin@digitalcomplaintwall.com";
    const adminPassword = "admin123";

    let admin = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (!admin) {
      admin = await User.create({
        name: "Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log("✅ Seeded default admin:", adminEmail);
    } else {
      await User.findByIdAndUpdate(admin._id, { password: hashedPassword });
      console.log("✅ Updated admin password:", adminEmail);
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log("HTTP server closed. Exiting.");
        process.exit(0);
      });
      setTimeout(() => {
        console.warn("Forcing shutdown after timeout.");
        process.exit(0);
      }, 3000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database", err);
    process.exit(1);
  });


