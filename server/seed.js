/*
  Seed script: creates admin and student users with sample complaints.
  Run: npm run seed
*/
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('./src/lib/db');
const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');

async function run() {
  await connectToDatabase();

  const adminEmail = 'admin@digitalcomplaintwall.com';
  const studentEmail = 'student@digitalcomplaintwall.com';

  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const studentPasswordHash = await bcrypt.hash('student123', 12);

  // Create or update admin user
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { 
      name: 'Admin User', 
      email: adminEmail, 
      password: adminPasswordHash, 
      role: 'admin' 
    },
    { new: true, upsert: true }
  );

  // Create or update student user
  const student = await User.findOneAndUpdate(
    { email: studentEmail },
    { 
      name: 'John Student', 
      email: studentEmail, 
      password: studentPasswordHash, 
      role: 'student' 
    },
    { new: true, upsert: true }
  );

  // Clear existing complaints for clean seed
  await Complaint.deleteMany({});

  // Generate complaint numbers
  function generateComplaintNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `DCW-${timestamp}-${random}`.toUpperCase();
  }

  // Create sample complaints
  const sampleComplaints = [
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: 'Hostel',
      description: 'Water leakage in bathroom of Room 205, Block A. The ceiling is dripping water continuously.',
      priority: 'High',
      status: 'Open',
      contactEmail: 'student@digitalcomplaintwall.com'
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: 'Mess',
      description: 'Food quality has deteriorated significantly. The rice is often undercooked and vegetables are stale.',
      priority: 'Medium',
      status: 'Under Review',
      contactEmail: 'student@digitalcomplaintwall.com'
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: 'Internet',
      description: 'WiFi connection is very slow in the library area. Cannot access online resources properly.',
      priority: 'Medium',
      status: 'Resolved',
      adminNote: 'New routers installed in library. Speed should be improved now.',
      contactEmail: 'student@digitalcomplaintwall.com'
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: 'Classroom',
      description: 'Projector in Room 101 is not working properly. Images are blurry and colors are distorted.',
      priority: 'High',
      status: 'Open',
      contactEmail: 'student@digitalcomplaintwall.com'
    },
    {
      complaintNumber: generateComplaintNumber(),
      studentId: student._id,
      category: 'Library',
      description: 'Air conditioning is not working in the reading section. It gets very hot during afternoon.',
      priority: 'Low',
      status: 'Open',
      contactEmail: 'student@digitalcomplaintwall.com'
    }
  ];

  await Complaint.insertMany(sampleComplaints);

  console.log('✅ Seed data created successfully!');
  console.log('📧 Admin Login:', { email: adminEmail, password: 'admin123' });
  console.log('👨‍🎓 Student Login:', { email: studentEmail, password: 'student123' });
  console.log('📊 Created', sampleComplaints.length, 'sample complaints');
  
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});


