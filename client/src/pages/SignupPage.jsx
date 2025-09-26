import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";

export default function SignupPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password, role });
      addToast("Account created. Please login.", { type: "success" });
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed";
      setError(msg);
      addToast(msg, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="role">Role</label>
            <select
              id="role"
              className="w-full border rounded px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">student</option>
              <option value="admin">admin</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            <span>{loading ? "Signing up..." : "Sign up"}</span>
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
