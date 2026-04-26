import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "/api";

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
});

// Add token to requests
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => authAPI.post("/register", data),
  login: (data) => authAPI.post("/login", data),
  verifyEmail: (token) => authAPI.post("/verify-email", { token }),
  getProfile: () => authAPI.get("/profile"),
  updateProfile: (data) => authAPI.put("/profile", data),
};

export default authService;
