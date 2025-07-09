import axios from "axios";

// Environment-based API URL configuration
const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  }
  
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 300000, // 5 minutes timeout for large file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

// Log the current API base URL for debugging
console.log(`🌐 API Base URL: ${getApiBaseUrl()}`);
console.log(`🏗️ Environment: ${process.env.NODE_ENV}`);

// Request interceptor
api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export default api; 