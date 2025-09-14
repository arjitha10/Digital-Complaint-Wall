# Digital Complaint Wall - Backend API

A complete Express.js + MongoDB backend API for the Digital Complaint Wall system.

## Features

- **JWT Authentication**: Secure user registration and login with role-based access
- **Complaint Management**: Create, read, update complaints with file uploads
- **File Handling**: Secure file upload and download with proper permissions
- **Email Notifications**: Automated email notifications using Nodemailer
- **Analytics**: Comprehensive analytics for admin dashboard
- **Security**: Rate limiting, CORS, Helmet security headers

## API Endpoints

### Authentication
- `POST /auth/register` - User registration (name, email, password, role)
- `POST /auth/login` - User login (email, password)

### Complaints
- `POST /api/complaints` - Create complaint (student only, multipart/form-data)
- `GET /api/complaints` - Get complaints (admin sees all, student sees own)
- `PATCH /api/complaints/:id` - Update complaint status (admin only)

### Files
- `GET /api/files/:id` - Download uploaded proof file

### Analytics (Admin Only)
- `GET /api/analytics/categories` - Count complaints by category
- `GET /api/analytics/status` - Resolved vs unresolved complaints
- `GET /api/analytics/priority` - Count complaints by priority

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```
   MONGO_URI=mongodb://localhost:27017/digital-complaint-wall
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   PORT=5000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Seed sample data**:
   ```bash
   npm run seed
   ```

5. **Production start**:
   ```bash
   npm start
   ```

## Database Models

### User
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['student', 'admin'])
}
```

### Complaint
```javascript
{
  studentId: ObjectId (ref: 'User'),
  category: String (required),
  description: String (required),
  priority: String (enum: ['High', 'Medium', 'Low']),
  status: String (enum: ['Open', 'Under Review', 'Resolved']),
  adminNote: String,
  file: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  createdAt: Date
}
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## File Uploads

- Supported formats: JPG, PNG, GIF, PDF, TXT
- Maximum file size: 10MB
- Files stored in `uploads/` directory
- Secure download with permission checks

## Email Configuration

The system supports both SMTP and Ethereal (for development):

- **Production**: Configure SMTP credentials in `.env`
- **Development**: Uses Ethereal for email preview URLs

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (300 requests per 15 minutes)
- CORS enabled
- Helmet security headers
- File upload validation

## Sample Data

After running `npm run seed`, you can login with:

**Admin:**
- Email: `admin@digitalcomplaintwall.com`
- Password: `admin123`

**Student:**
- Email: `student@digitalcomplaintwall.com`
- Password: `student123`

## Technologies Used

- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Nodemailer for emails
- bcryptjs for password hashing
- Helmet, CORS, Morgan for security and logging

