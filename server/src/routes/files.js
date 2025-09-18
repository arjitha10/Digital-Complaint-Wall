import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /api/files/upload
router.post("/upload", authenticate, upload.single("file"), (req, res) => {
  res.json({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

// GET /api/files/:filename
router.get("/:filename", authenticate, (req, res) => {
  const filepath = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: "File not found" });
  }
  res.sendFile(filepath);
});

export default router;


