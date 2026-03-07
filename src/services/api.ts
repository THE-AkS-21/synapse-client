import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

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

export default api;
