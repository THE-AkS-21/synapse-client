import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Existing Request Interceptor
api.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");

  // Fallback if token is stored inside zustand persist object
  if (!token) {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token;
      } catch (e) {
        console.error("Could not parse auth-storage", e);
      }
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("Axios request without auth token!");
  }

  return config;
});

// ADD THIS: Response Interceptor for Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Check if the backend rejected the token
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.warn("Session expired or unauthorized. Logging out...");

        // Clear the Zustand store and local storage
        useAuthStore.getState().logout();

        // Force redirect to login page if on the client side
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
);

export default api;