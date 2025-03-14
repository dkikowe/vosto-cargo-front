import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5050",
});

instance.interceptors.request.use((config) => {
  config.headers.Authorization = localStorage.getItem("token");
  return config;
});

export default instance;
