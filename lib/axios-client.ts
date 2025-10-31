import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const axiosClient = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    // Set Content-Type for JSON requests only (FormData will set its own automatically)
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Get token from localStorage or cookie on client side
    if (typeof window !== "undefined") {
      // Try localStorage first
      let token = localStorage.getItem("menta_session");

      // Fall back to cookie if not in localStorage
      if (!token) {
        const cookies = document.cookie.split(";");
        const sessionCookie = cookies.find((c) =>
          c.trim().startsWith("menta_session=")
        );
        token = sessionCookie ? sessionCookie.split("=")[1] : null;
      }

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login on unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("menta_session");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
