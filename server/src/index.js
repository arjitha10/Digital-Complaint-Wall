const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectToDatabase } = require('./config/db');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const analyticsRoutes = require('./routes/analytics');
const filesRoutes = require('./routes/files');
const { notFoundHandler, globalErrorHandler } = require('./middleware/error');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security & utils
app.use(helmet());

// Configurable CORS origins via env (comma-separated)
const defaultCorsOrigins = [
  'https://digital-complaint-wall-ljsi.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];
const envCorsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = envCorsOrigins.length > 0 ? envCorsOrigins : defaultCorsOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser/SSR requests without an Origin (e.g., curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);

// Root welcome route
app.get('/', (req, res) => {
  res.type('text/plain').send('Welcome to Digital Complaint Wall API');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/files', filesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

console.log('Environment variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('PORT:', PORT);

connectToDatabase()
  .then(() => {
    console.log('Database connected successfully');

    // Seed admin user if not exists
    (async () => {
      try {
        // Match frontend demo credentials
        const adminEmail = 'admin@digitalcomplaintwall.com';
        const adminPassword = 'admin123';
        
        // Check if admin exists
        let admin = await User.findOne({ email: adminEmail });
        
        if (!admin) {
          // Create new admin
          const hashedPassword = await bcrypt.hash(adminPassword, 12);
          admin = await User.create({
            name: 'Administrator',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
          });
          console.log('✅ Seeded default admin:', adminEmail);
        } else {
          // Update existing admin password to ensure it's correct
          const hashedPassword = await bcrypt.hash(adminPassword, 12);
          await User.findByIdAndUpdate(admin._id, { password: hashedPassword });
          console.log('✅ Updated admin password:', adminEmail);
        }
        
        // Verify admin can login
        const testLogin = await bcrypt.compare(adminPassword, admin.password);
        console.log('✅ Admin login test:', testLogin ? 'PASSED' : 'FAILED');
        
      } catch (seedErr) {
        console.error('❌ Admin seeding failed:', { message: seedErr.message, stack: seedErr.stack });
      }
    })();

    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });

    // Graceful shutdown so nodemon restarts don't leave the port bound
    const shutdown = (signal) => {
      // eslint-disable-next-line no-console
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      try {
        server.close(() => {
          // eslint-disable-next-line no-console
          console.log('HTTP server closed. Exiting.');
          process.exit(0);
        });
        // In case there are open connections preventing close, force exit after timeout
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.warn('Forcing shutdown after timeout.');
          process.exit(0);
        }, 3000).unref();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error during shutdown:', e);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database', err);
    process.exit(1);
  });


