import axios from "axios";

export const AXIOS_API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});
