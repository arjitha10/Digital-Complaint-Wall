// src/config/db.js
import mongoose from "mongoose";

export const connectToDatabase = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set");
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
};




