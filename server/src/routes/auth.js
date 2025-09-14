const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate role
    if (role && !['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'student' 
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name, 
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email, hasPassword: !!password });
    
    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        success: false,
        message: 'Missing email or password' 
      });
    }
    
    // Find user (normalize email)
    const normalizedEmail = String(email).toLowerCase().trim();
    console.log('🔍 Looking for user:', normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    console.log('👤 User found:', { id: user._id, role: user.role, email: user.email });
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔑 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', normalizedEmail);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name, 
        email: user.email 
      }, 
      process.env.JWT_SECRET || 'dev_secret_key_change_in_production', 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful for:', email, 'role:', user.role);

    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ POST /api/auth/login error:', {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

module.exports = router;


