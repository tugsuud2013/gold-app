import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("admin_token") ?? localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "success" in payload) {
      if (!payload.success) {
        throw new Error(payload.message ?? "Алдаа гарлаа");
      }
      return payload.data;
    }
    return payload;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      Cookies.remove("admin_token");
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    const message = error?.response?.data?.message ?? error.message ?? "Алдаа гарлаа";
    return Promise.reject(new Error(message));
  },
);

export default api;
