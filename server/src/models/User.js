const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // Will be hashed before saving
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('User', userSchema);


