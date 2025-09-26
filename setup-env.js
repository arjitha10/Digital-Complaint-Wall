const fs = require('fs');
const path = require('path');

// Create client .env file
const clientEnvContent = `VITE_API_BASE_URL=http://localhost:5000/api
`;

// Create server .env file
const serverEnvContent = `# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/complaint-wall

# JWT Secret for authentication
JWT_SECRET=digital-complaint-wall-super-secret-jwt-key-2024

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (SMTP) - Using Ethereal for development
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=ethereal.user@ethereal.email
SMTP_PASS=ethereal.pass
EMAIL_FROM=no-reply@digitalcomplaintwall.com
`;

try {
  // Create client .env
  fs.writeFileSync(path.join(__dirname, 'client', '.env'), clientEnvContent);
  console.log('✅ Created client/.env file');
  
  // Create server .env
  fs.writeFileSync(path.join(__dirname, 'server', '.env'), serverEnvContent);
  console.log('✅ Created server/.env file');
  
  console.log('\n📝 Environment files created successfully!');
  console.log('⚠️  Please update the server/.env file with your actual MongoDB URI and email credentials.');
  console.log('🔧 You can now run:');
  console.log('   - Server: cd server && npm run dev');
  console.log('   - Client: cd client && npm run dev');
} catch (error) {
  console.error('❌ Error creating environment files:', error.message);
}
