import axios from "axios";

const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  }
  
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
};

const httpClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 300000, // 5 minutes timeout for large file uploads
  headers: {
    "Content-Type": "application/json",
  }
});

httpClient.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

httpClient.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export { httpClient };
