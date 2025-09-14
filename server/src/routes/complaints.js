const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { authenticate, optionalAuthenticate, requireRole } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Multer configuration for file uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, unique + '-' + safeName);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, PDF, and TXT files are allowed'));
  }
}

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Generate unique complaint number
function generateComplaintNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `DCW-${timestamp}-${random}`.toUpperCase();
}

// POST /api/complaints - Create complaint (student token optional)
router.post('/', optionalAuthenticate, upload.single('file'), async (req, res, next) => {
  try {
    const { category, description, priority, contactEmail, contactPhone } = req.body;
    
    // Validate required fields
    if (!category || !description || !priority) {
      return res.status(400).json({ message: 'Missing required fields: category, description, priority' });
    }
    
    // Validate priority
    if (!['High', 'Medium', 'Low'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority. Must be High, Medium, or Low' });
    }
    
    // Generate unique complaint number
    const complaintNumber = generateComplaintNumber();
    
    // Prepare complaint data
    const complaintData = {
      complaintNumber,
      category,
      description,
      priority,
      status: 'Open',
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null
    };

    // If authenticated student, attach studentId
    if (req.user && req.user.id) {
      complaintData.studentId = req.user.id;
    }
    
    // Handle file upload if present
    if (req.file) {
      complaintData.file = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }
    
    // Create complaint
    const complaint = await Complaint.create(complaintData);
    
    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaintNumber: complaint.complaintNumber,
      complaint: {
        complaintNumber: complaint.complaintNumber,
        category: complaint.category,
        priority: complaint.priority,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });
  } catch (err) {
    // Add more detailed server-side logging
    // eslint-disable-next-line no-console
    console.error('POST /api/complaints error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: err.message || 'Failed to submit complaint' });
  }
});

// GET /api/complaints - Get all complaints (admin only)
router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const complaints = await Complaint.find({})
      .sort({ createdAt: -1 });
    
    res.json(complaints);
  } catch (err) {
    next(err);
  }
});

// GET /api/complaints/status/:complaintNumber - Check complaint status by number (public)
router.get('/status/:complaintNumber', async (req, res, next) => {
  try {
    const { complaintNumber } = req.params;
    
    const complaint = await Complaint.findOne({ complaintNumber });
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Return only public information
    res.json({
      complaintNumber: complaint.complaintNumber,
      category: complaint.category,
      priority: complaint.priority,
      status: complaint.status,
      adminNote: complaint.adminNote,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/complaints/:id - Update complaint status (admin only)
router.patch('/:id', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    
    // Validate status
    const allowedStatuses = ['Open', 'Under Review', 'Resolved'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Open, Under Review, or Resolved' });
    }
    
    // Prepare update data
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    
    // Update complaint
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('studentId', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Send email notification if complaint is resolved and contact email is provided
    if (status === 'Resolved' && complaint.contactEmail) {
      try {
        await sendEmail({
          to: complaint.contactEmail,
          subject: `Complaint ${complaint.complaintNumber} has been resolved`,
          html: `
            <h2>Complaint Resolution Notification</h2>
            <p>Dear Complainant,</p>
            <p>Your complaint <strong>${complaint.complaintNumber}</strong> regarding "${complaint.category}" has been resolved.</p>
            <p><strong>Resolution Note:</strong> ${adminNote || 'No additional notes provided.'}</p>
            <p>You can check the status of your complaint anytime using the complaint number: <strong>${complaint.complaintNumber}</strong></p>
            <p>Thank you for using our Digital Complaint Wall system.</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


