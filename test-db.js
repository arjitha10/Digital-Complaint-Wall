const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./server/src/models/User');

async function testDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://231401014:12345@clusterdcw.gxvmfhu.mongodb.net/?retryWrites=true&w=majority&appName=ClusterDCW';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');
    
    // Test admin user
    const adminEmail = 'admin@wall.com';
    const adminPassword = 'admin123';
    
    console.log('👤 Checking admin user...');
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin user not found, creating...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      admin = await User.create({
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user exists');
    }
    
    // Test password
    const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
    console.log('🔑 Password test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // List all users
    const allUsers = await User.find({});
    console.log('📊 All users in database:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDatabase();




