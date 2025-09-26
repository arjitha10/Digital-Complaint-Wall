const express = require('express');
const Complaint = require('../models/Complaint');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require admin authentication
router.use(authenticate, requireRole('admin'));

// GET /api/analytics/categories - Count complaints by category
router.get('/categories', async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          category: '$_id', 
          count: 1 
        } 
      },
      { 
        $sort: { count: -1 } 
      }
    ]);
    
    res.json({
      message: 'Analytics data retrieved successfully',
      data
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/status - Resolved vs unresolved complaints
router.get('/status', async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$status', 'Resolved'] }, 
              'Resolved', 
              'Unresolved'
            ]
          },
          count: { $sum: 1 }
        }
      },
      { 
        $project: { 
          _id: 0, 
          status: '$_id', 
          count: 1 
        } 
      },
      { 
        $sort: { count: -1 } 
      }
    ]);
    
    res.json({
      message: 'Status analytics retrieved successfully',
      data
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/priority - Count complaints by priority
router.get('/priority', async (req, res, next) => {
  try {
    const data = await Complaint.aggregate([
      { 
        $group: { 
          _id: '$priority', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          priority: '$_id', 
          count: 1 
        } 
      },
      { 
        $sort: { 
          priority: 1 // Sort by priority order: High, Medium, Low
        } 
      }
    ]);
    
    res.json({
      message: 'Priority analytics retrieved successfully',
      data
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


