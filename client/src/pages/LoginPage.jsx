import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";

export default function LoginPage() {
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
      const res = await api.post("/auth/login", { 
        email: email.trim().toLowerCase(),
        password 
      });

      // Persist tokens for subsequent authenticated requests
      if (res?.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      const role = res?.data?.user?.role || res?.data?.role || "student";
      if (role === "admin") {
        if (res?.data?.token) localStorage.setItem("adminToken", res.data.token);
        addToast("Logged in successfully as admin", { type: "success" });
        navigate("/admin", { replace: true });
      } else {
        if (res?.data?.token) localStorage.setItem("studentToken", res.data.token);
        addToast("Logged in successfully", { type: "success" });
        navigate("/student", { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
      addToast(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding and Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562A4.001 4.001 0 0116 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.551l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.124-1.271l-1.56-1.56A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.667zM14.828 14.828a4 4 0 01-5.656 0L7.757 13.757a6 6 0 008.486 0l-1.415 1.071z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Digital Complaint Wall</h1>
          </div>
          <h2 className="text-4xl font-bold mb-6">Your Voice Matters</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            A modern platform for students to submit complaints and for administrators to manage them efficiently. 
            Track, resolve, and improve campus life together.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-blue-100">Real-time complaint tracking</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-blue-100">Secure file uploads for evidence</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-blue-100">Email notifications for updates</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-blue-100">Analytics and reporting dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562A4.001 4.001 0 0116 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.551l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.124-1.271l-1.56-1.56A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.667zM14.828 14.828a4 4 0 01-5.656 0L7.757 13.757a6 6 0 008.486 0l-1.415 1.071z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Digital Complaint Wall</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your complaint dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading && <Spinner />}
                <span>{loading ? "Signing in..." : "Sign In"}</span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Create one here
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Demo Credentials:</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin:</span>
                  <span className="font-mono text-gray-800">admin@digitalcomplaintwall.com / admin123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-mono text-gray-800">student@digitalcomplaintwall.com / student123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
