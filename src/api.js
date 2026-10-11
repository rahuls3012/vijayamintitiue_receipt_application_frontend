import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api" });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Token ${t}`;
  return cfg;
});
api.interceptors.response.use(null, (err) => {
  if (err.response?.status === 401) { localStorage.removeItem("token"); window.location.reload(); }
  return Promise.reject(err);
});

export default api;
