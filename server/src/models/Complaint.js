const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    // Anonymous complaint system
    complaintNumber: { type: String, unique: true, required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true }, // Made optional for anonymous complaints
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'], index: true },
    status: { type: String, enum: ['Open', 'Under Review', 'Resolved'], default: 'Open', index: true },
    adminNote: { type: String },
    // Contact info for notifications (optional)
    contactEmail: { type: String, required: false },
    contactPhone: { type: String, required: false },
    file: {
      filename: { type: String },
      originalName: { type: String },
      mimetype: { type: String },
      size: { type: Number },
      path: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);


