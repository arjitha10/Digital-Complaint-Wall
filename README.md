## Digital Complaint Wall

### Project Overview
A full‑stack web app for students to submit complaints (with optional file proof) and for admins to track, filter, and resolve them. Includes email notifications when complaints are resolved and analytics (category distribution, resolution status, priority breakdown).

### Prerequisites
- Node.js and npm
- MongoDB Atlas account (connection string)

### Backend Setup
1. Copy environment file and fill values:
   - Copy `server/.env.example` → `server/.env`
   - Set: `MONGO_URI`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
2. Install dependencies:
   - `cd server`
   - `npm install`
3. Run the server (development):
   - `npm run dev`
   - Or production: `npm start`

### Frontend Setup
1. Copy environment file and fill values:
   - Copy `client/.env.example` → `client/.env`
   - Set: `VITE_API_BASE_URL` to your backend URL (e.g., `https://your-backend-domain.com/api`)
2. Install dependencies:
   - `cd client`
   - `npm install`
3. Run the client (development):
   - `npm run dev`

### Deployment
- Build frontend:
  - `cd client && npm run build` (output in `client/dist/`)
- Deploy backend (Render/Heroku/AWS):
  - Start command in `server/`: `npm start`
  - Environment variables: set all from `server/.env`
  - MongoDB: use MongoDB Atlas connection string
- Deploy frontend (Vercel/Netlify):
  - Project root: `client/`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_BASE_URL` → your deployed backend `/api` URL

### Test Checklist
- Student flow
  - Signup/login as student
  - Submit complaint (with/without file) → confirm table updates
- Admin flow
  - Login as admin
  - View and filter complaints (Status/Category/Priority)
  - Change status to Resolved (adds note) → verify student receives email
- Files
  - Download proof files from student/admin views

### Notes
- Axios base URL is configurable via `VITE_API_BASE_URL` with a local fallback to `http://localhost:5000/api`.
- Keep real `.env` files out of version control; only commit the `.env.example` files.
"# Digital-Complaint-Wall" 
"# Digital-Complaint-Wall" 
