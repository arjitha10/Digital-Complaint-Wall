const path = require('path');
const fs = require('fs');
const express = require('express');
const Complaint = require('../models/Complaint');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/files/:id - Download uploaded proof file
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    
    // Find complaint with file information
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if complaint has a file
    if (!complaint.file || !complaint.file.filename) {
      return res.status(404).json({ message: 'No file attached to this complaint' });
    }
    
    // Check permissions: admin can download any file, student can only download their own
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = complaint.studentId && req.user && complaint.studentId.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Construct file path
    const filePath = path.join(__dirname, '..', '..', 'uploads', complaint.file.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Set appropriate headers and send file
    res.setHeader('Content-Disposition', `attachment; filename="${complaint.file.originalName}"`);
    res.setHeader('Content-Type', complaint.file.mimetype);
    
    res.download(filePath, complaint.file.originalName);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


