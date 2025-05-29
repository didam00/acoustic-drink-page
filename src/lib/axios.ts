import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "", // 옵션
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

const youtube = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;