import axios from "axios";

// console.log(process.env.NODE_ENV);

export const AXIOS_API = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "https://google-docs-abot.onrender.com/api",
  withCredentials: true,
});
