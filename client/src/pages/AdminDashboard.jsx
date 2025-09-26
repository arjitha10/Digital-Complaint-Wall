import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_FLOW = ["Open", "Under Review", "Resolved"];
const COLORS = ["#6366F1", "#22C55E", "#EF4444", "#F59E0B", "#0EA5E9", "#8B5CF6"];
const CATEGORY_OPTIONS = [
  "Hostel",
  "Mess",
  "Canteen",
  "Bathroom",
  "Classroom",
  "Library",
  "Internet",
  "Other",
];

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [filters, setFilters] = useState({ status: "", category: "", priority: "" });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📊 Fetching complaints...");
      
      // Check if we have a token
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      console.log("🔑 Token available:", !!token);
      
      const { data } = await api.get("/complaints");
      console.log("✅ Complaints fetched:", data);
      setComplaints(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ Failed to fetch complaints:", e);
      const errorMsg = e?.response?.data?.message || "Failed to load complaints";
      setError(errorMsg);
      
      // If it's an auth error, redirect to login
      if (e?.response?.status === 401) {
        console.log("🔒 Authentication failed, redirecting to login");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        window.location.href = "/admin-login";
      }
    } finally {
      setLoading(false);
    }
  };

  const updateComplaint = async (complaintId) => {
    try {
      const updateData = {};
      if (newStatus) updateData.status = newStatus;
      if (adminNote) updateData.adminNote = adminNote;

      await api.patch(`/complaints/${complaintId}`, updateData);
      
      // Refresh complaints list
      await fetchComplaints();
      
      // Reset form
      setEditingComplaint(null);
      setAdminNote("");
      setNewStatus("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update complaint");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)] || STATUS_FLOW[0];
  };

  const changeStatus = async (complaint) => {
    const current = complaint.status;
    const next = getNextStatus(current);
    let adminNote = "";
    if (next === "Resolved") {
      adminNote = window.prompt("Add a resolution note (optional):", "");
    }
    try {
      await api.patch(`/complaints/${complaint._id || complaint.id}`, {
        status: next,
        adminNote,
      });
      await fetchComplaints();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  const downloadFile = async (complaintId) => {
    try {
      const res = await api.get(`/files/${complaintId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "proof";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed");
    }
  };

  // Derived filtered list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const statusOk = !filters.status || c.status === filters.status;
      const categoryVal = c.category || c.type || "";
      const categoryOk = !filters.category || categoryVal === filters.category;
      const priorityVal = c.priority || "";
      const priorityOk = !filters.priority || priorityVal === filters.priority;
      return statusOk && categoryOk && priorityOk;
    });
  }, [complaints, filters]);

  // Analytics
  const byCategory = useMemo(() => {
    const map = {};
    for (const c of filteredComplaints) {
      const key = c.category || c.type || "Other";
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredComplaints]);

  const resolvedVs = useMemo(() => {
    const resolved = filteredComplaints.filter((c) => c.status === "Resolved").length;
    const unresolved = filteredComplaints.length - resolved;
    return [
      { name: "Resolved", value: resolved },
      { name: "Unresolved", value: unresolved },
    ];
  }, [filteredComplaints]);

  const byPriority = useMemo(() => {
    const map = { Low: 0, Medium: 0, High: 0 };
    for (const c of filteredComplaints) {
      const p = c.priority || "Medium";
      map[p] = (map[p] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredComplaints]);

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={fetchComplaints}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              localStorage.removeItem("token");
              window.location.href = "/admin-login";
            }}
            className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-3">All Complaints</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Status</label>
            <select
              className="border rounded px-3 py-2"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All</option>
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Category</label>
            <select
              className="border rounded px-3 py-2"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">All</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Priority</label>
            <select
              className="border rounded px-3 py-2"
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Complaint Number</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created At</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c._id || c.id} className="border-b align-top">
                    <td className="p-2 font-mono text-sm">{c.complaintNumber || "-"}</td>
                    <td className="p-2">{c.category || c.type}</td>
                    <td className="p-2 max-w-lg">
                      <div className="line-clamp-3 whitespace-pre-wrap break-words">{c.description}</div>
                    </td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.priority === 'High' ? 'bg-red-100 text-red-800' :
                        c.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        c.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => {
                          setEditingComplaint(c);
                          setNewStatus(c.status);
                          setAdminNote(c.adminNote || "");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-1 text-xs"
                      >
                        Edit
                      </button>
                      {c.file?.filename ? (
                        <button
                          className="bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 text-xs"
                          onClick={() => downloadFile(c._id || c.id)}
                        >
                          Download
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-medium mb-2">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={100} label>
                {byCategory.map((entry, index) => (
                  <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-medium mb-2">Resolved vs Unresolved</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={resolvedVs} dataKey="value" nameKey="name" outerRadius={100} label>
                {resolvedVs.map((entry, index) => (
                  <Cell key={`cell-res-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow h-80">
          <h3 className="font-medium mb-2">Complaints by Priority</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Edit Complaint Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Complaint: {editingComplaint.complaintNumber}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Note
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add a note about the resolution or status update..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setEditingComplaint(null);
                    setAdminNote("");
                    setNewStatus("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateComplaint(editingComplaint._id || editingComplaint.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Update Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
