import axios from "axios";

const youtube = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

export default youtube;
