# Digital Complaint Wall - Frontend

A React (Vite) + TailwindCSS frontend for the Digital Complaint Wall project.

## Features

- **Authentication**: Login and Signup pages with role-based routing
- **Student Dashboard**: Submit complaints with file uploads and view complaint history
- **Admin Dashboard**: Manage complaints, update status, view analytics with charts
- **Responsive Design**: Mobile-optimized with TailwindCSS
- **Toast Notifications**: Success/error feedback system
- **File Downloads**: Download proof files for complaints

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── api/
│   └── axios.js          # API configuration
├── components/
│   ├── Spinner.jsx       # Loading spinner
│   └── ToastProvider.jsx # Toast notifications
├── pages/
│   ├── LoginPage.jsx     # User login
│   ├── SignupPage.jsx    # User registration
│   ├── StudentDashboard.jsx # Student complaint management
│   └── AdminDashboard.jsx  # Admin complaint management
├── App.jsx               # Main app with routing
├── main.jsx              # Entry point
└── index.css             # TailwindCSS imports
```

## API Integration

The frontend integrates with the Express backend API:

- **Authentication**: `/auth/login`, `/auth/register`
- **Complaints**: `/api/complaints` (GET, POST, PATCH)
- **Files**: `/api/files/:id` (GET for downloads)

## Technologies Used

- React 18
- Vite
- TailwindCSS
- React Router
- Axios
- Recharts (for analytics)

