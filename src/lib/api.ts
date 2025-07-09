import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 300000, // 5 minutes timeout for large file uploads
  headers: {
    "Content-Type": "application/json",
  },
});

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