import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("🔐 Admin login request", { 
        url: "/auth/login", 
        email, 
        baseURL: api.defaults.baseURL 
      });
      
      const res = await api.post("/auth/login", { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log("✅ Admin login response", { 
        status: res.status, 
        data: res.data 
      });
      
      // Check if login was successful
      if (res.data.success && res.data.token) {
        // Store tokens
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("token", res.data.token);
        
        const role = res.data.user?.role || res.data.role;
        console.log("👤 User role:", role);
        
        if (role === "admin") {
          addToast("Admin login successful!", { type: "success" });
          navigate("/admin", { replace: true });
        } else {
          setError("Access denied. Admin privileges required.");
          addToast("Access denied. Admin privileges required.", { type: "error" });
        }
      } else {
        const msg = res.data.message || "Login failed";
        setError(msg);
        addToast(msg, { type: "error" });
      }
    } catch (err) {
      console.error("❌ Admin login failed", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });
      
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
      addToast(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562A4.001 4.001 0 0116 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.551l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.124-1.271l-1.56-1.56A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.667zM14.828 14.828a4 4 0 01-5.656 0L7.757 13.757a6 6 0 008.486 0l-1.415 1.071z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the complaint management dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Spinner />}
              <span className="ml-2">{loading ? "Signing in..." : "Sign in"}</span>
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Complaint Submission
            </Link>
          </div>

          
        </form>
      </div>
    </div>
  );
}

