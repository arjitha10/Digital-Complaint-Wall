import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://backend-on7u.onrender.com/api";

const api = axios.create({
  baseURL,
  // Do not set global Content-Type so FormData can set its own boundary
  headers: {
    Accept: "application/json",
  },
  // Not using cookie auth; keep credentials disabled to avoid CORS complexity
  withCredentials: false,
});

// Attach Authorization header from localStorage token if available
api.interceptors.request.use(
  (config) => {
    let token = null;
    if (typeof window !== "undefined") {
      token =
        localStorage.getItem("token") ||
        localStorage.getItem("studentToken") ||
        localStorage.getItem("adminToken");
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: surface more detailed errors
api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.log("API Success:", {
      url: response?.config?.url,
      method: response?.config?.method,
      status: response?.status,
      data: response?.data,
    });
    return response;
  },
  (error) => {
    // Keep original error, but log useful context for debugging
    // eslint-disable-next-line no-console
    console.error("API Error:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

export default api;
