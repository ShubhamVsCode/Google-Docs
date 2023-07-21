import axios from "axios";

export const AXIOS_API = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: "https://google-docs-abot.onrender.com/",
  withCredentials: true,
});
