import React, { useState } from "react";
import { Link } from "react-router-dom";
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

export default function HomePage() {
  const { addToast } = useToast();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [file, setFile] = useState(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [complaintNumber, setComplaintNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setComplaintNumber("");

    if (!category || !description.trim() || !priority) {
      setError("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("priority", priority);
    if (contactEmail) formData.append("contactEmail", contactEmail);
    if (contactPhone) formData.append("contactPhone", contactPhone);
    if (file) {
      formData.append("file", file);
    }

    try {
      setSubmitting(true);
      console.log("Submitting complaint...", { category, description, priority, contactEmail, contactPhone, file: file?.name });
      const response = await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("Complaint submitted successfully:", response.data);
      setCategory(CATEGORIES[0]);
      setDescription("");
      setPriority("Medium");
      setFile(null);
      setContactEmail("");
      setContactPhone("");
      setComplaintNumber(response.data.complaintNumber);
      setMessage("Complaint submitted successfully!");
      addToast("Complaint submitted successfully!", { type: "success" });
    } catch (e) {
      console.error("Complaint submission failed:", e);
      const msg = e?.response?.data?.message || "Submission failed";
      setError(msg);
      addToast(msg, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562A4.001 4.001 0 0116 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.551l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.124-1.271l-1.56-1.56A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.667zM14.828 14.828a4 4 0 01-5.656 0L7.757 13.757a6 6 0 008.486 0l-1.415 1.071z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Digital Complaint Wall</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin-login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Submit Your Complaint Anonymously
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your voice matters! Submit complaints about campus issues anonymously. 
            Get a unique complaint number to track your issue and receive updates when resolved.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Complaint Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Submit New Complaint
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category">
                      Category *
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
                      Priority Level *
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
                    Complaint Description *
                  </label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                    rows="5"
                    placeholder="Please provide a detailed description of your complaint..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contactEmail">
                      Contact Email (Optional)
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="your.email@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">For resolution notifications</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contactPhone">
                      Contact Phone (Optional)
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="+1234567890"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">For urgent matters</p>
                  </div>
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

          {/* Information Panel */}
          <div className="space-y-6">
            {/* Success Message with Complaint Number */}
            {complaintNumber && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Complaint Submitted Successfully!</h3>
                </div>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your complaint number is:</p>
                  <p className="text-2xl font-bold text-gray-900 font-mono">{complaintNumber}</p>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Save this number to track your complaint status. You can check the status anytime using the link below.
                </p>
                <Link
                  to={`/status/${complaintNumber}`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Track Status
                </Link>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Submit Anonymously</h4>
                    <p className="text-sm text-gray-600">Fill out the form with your complaint details. No personal information required.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Get Complaint Number</h4>
                    <p className="text-sm text-gray-600">Receive a unique complaint number to track your issue.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Track Progress</h4>
                    <p className="text-sm text-gray-600">Use your complaint number to check status updates anytime.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Get Notified</h4>
                    <p className="text-sm text-gray-600">Receive email notifications when your complaint is resolved.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Complaint Status</h3>
              <p className="text-sm text-gray-600 mb-4">
                Already submitted a complaint? Enter your complaint number to check its status.
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter complaint number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const complaintNumber = e.target.value.trim();
                      if (complaintNumber) {
                        window.location.href = `/status/${complaintNumber}`;
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter complaint number"]');
                    const complaintNumber = input.value.trim();
                    if (complaintNumber) {
                      window.location.href = `/status/${complaintNumber}`;
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

