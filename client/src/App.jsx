import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintStatus from "./pages/ComplaintStatus";
import ToastProvider from "./components/ToastProvider";

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/status/:complaintNumber" element={<ComplaintStatus />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
