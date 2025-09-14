import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";

const CATEGORIES = [
  "Hostel",
  "Mess",
  "Canteen",
  "Bathroom",
  "Classroom",
  "Library",
  "Internet",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High"];

export default function StudentDashboard() {
  const { addToast } = useToast();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [file, setFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const loadComplaints = async () => {
    try {
      setLoadingList(true);
      const { data } = await api.get("/complaints");
      setComplaints(Array.isArray(data) ? data : []);
    } catch (e) {
      // silent or set error banner
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!category || !description.trim() || !priority) {
      setError("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("priority", priority);
    if (file) {
      formData.append("file", file);
    }

    try {
      setSubmitting(true);
      // eslint-disable-next-line no-console
      console.log('Submitting complaint', { category, priority, hasFile: !!file });
      const res = await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // eslint-disable-next-line no-console
      console.log('Complaint submitted response', { status: res.status, data: res.data });
      setCategory(CATEGORIES[0]);
      setDescription("");
      setPriority("Medium");
      setFile(null);
      setMessage("Complaint submitted successfully.");
      addToast("Complaint submitted", { type: "success" });
      await loadComplaints();
    } catch (e) {
      const status = e?.response?.status;
      const serverMessage = e?.response?.data?.message;
      const msg = serverMessage
        || (status === 401 ? "Unauthorized. Please login again."
        : status === 403 ? "Forbidden. You do not have access."
        : status === 413 ? "File too large. Max size is 10MB."
        : "Submission failed. Please try again.");
      setError(msg);
      addToast(msg, { type: "error" });
      // eslint-disable-next-line no-console
      console.error("Submit complaint failed", {
        status: e?.response?.status,
        data: e?.response?.data,
      });
    } finally {
      setSubmitting(false);
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
      addToast("Download failed", { type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00-.078-2.183l1.562-1.562A4.001 4.001 0 0116 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.551l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.124-1.271l-1.56-1.56A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.667zM14.828 14.828a4 4 0 01-5.656 0L7.757 13.757a6 6 0 008.486 0l-1.415 1.071z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Digital Complaint Wall</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Student Portal</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Complaint Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Submit New Complaint
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="priority">
                      Priority Level
                    </label>
                    <select
                      id="priority"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                    Complaint Description
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                    rows="5"
                    placeholder="Please provide a detailed description of your complaint..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="file">
                    Supporting Evidence (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            id="file"
                            type="file"
                            className="sr-only"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </div>
                  </div>
                  {file && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {file.name}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {submitting && <Spinner />}
                  <span>{submitting ? "Submitting Complaint..." : "Submit Complaint"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* My Complaints */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Complaints
              </h2>
            </div>
            <div className="p-6">
              {loadingList ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                  <span className="ml-2 text-gray-600">Loading complaints...</span>
                </div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No complaints yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by submitting your first complaint.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((c) => (
                    <div key={c._id || c.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {c.category || c.type}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.priority === 'High' ? 'bg-red-100 text-red-800' :
                              c.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {c.priority}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                              c.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {c.description?.substring(0, 100)}
                            {c.description?.length > 100 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            Submitted: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
                          </p>
                        </div>
                        <div className="ml-4">
                          {c.file?.filename ? (
                            <button
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                              onClick={() => downloadFile(c._id || c.id)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No file</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
