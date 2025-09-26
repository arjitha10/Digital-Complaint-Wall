import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import { useToast } from "../components/ToastProvider";

export default function ComplaintStatus() {
  const { complaintNumber } = useParams();
  const { addToast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/complaints/status/${complaintNumber}`);
        setComplaint(response.data);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to fetch complaint status";
        setError(msg);
        addToast(msg, { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (complaintNumber) {
      fetchComplaint();
    }
  }, [complaintNumber, addToast]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading complaint status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Complaint Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Submit New Complaint
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Complaint Status</h2>
            <p className="text-blue-100">Complaint Number: {complaint.complaintNumber}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Complaint Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{complaint.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Submitted</label>
                  <p className="text-gray-900">{new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}</p>
                </div>
                
                {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Last Updated</label>
                    <p className="text-gray-900">{new Date(complaint.updatedAt).toLocaleDateString()} at {new Date(complaint.updatedAt).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Status Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Complaint Submitted</p>
                      <p className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {complaint.status === 'Under Review' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Under Review</p>
                        <p className="text-xs text-gray-500">Administrator is reviewing your complaint</p>
                      </div>
                    </div>
                  )}
                  
                  {complaint.status === 'Resolved' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Resolved</p>
                        <p className="text-xs text-gray-500">Your complaint has been resolved</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Note */}
            {complaint.adminNote && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Administrator Note</h4>
                <p className="text-sm text-blue-800">{complaint.adminNote}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Submit New Complaint
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

