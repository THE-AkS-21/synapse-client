import axios from "axios";
import { useAuthStore } from "../store/authStore";

/**
 * ARCHITECTURE NOTE: Axios Gateway
 * Centralizes all REST API calls.
 * baseURL dynamically switches based on the environment (local dev vs. Vercel prod).
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
});

// Request Interceptor: Attach JWT to every outbound request
api.interceptors.request.use((config) => {
  // Read directly from Zustand's memory state instead of parsing localStorage.
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor: Global Error Boundary
api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Intercept HTTP 401 (Unauthorized) or 403 (Forbidden)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.warn("SECURITY: Session expired or token invalidated. Purging state.");

        // Wipe the local state and storage
        useAuthStore.getState().logout();

        // Force a hard redirect to the login page to clear any residual React state
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
);

export default api;