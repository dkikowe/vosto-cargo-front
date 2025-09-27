import axios from "axios";

const instance = axios.create({
  baseURL: "https://vosto-cargo-back-production.up.railway.app/",
  // baseURL: "http://localhost:5051",
});

instance.interceptors.request.use((config) => {
  config.headers.Authorization = localStorage.getItem("token");
  return config;
});

export default instance;
