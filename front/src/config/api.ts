// API base URL configuration
export const API_URL =
  import.meta.env.MODE === "production"
    ? "https://genuinepharmacy.com/api"
    : "http://localhost:4008/api";
