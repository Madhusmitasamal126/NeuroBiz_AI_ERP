
import axios from "axios";

// FastAPI AI service runs on port 9000.
const ai = axios.create({
  baseURL: "http://127.0.0.1:9000",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the Django JWT access token to protected FastAPI requests.
ai.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access") ||
      sessionStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Generate an AI business report.
export function generateReport(question) {
  return ai.post("/ai/report", { question });
}

// Send a message to the AI business chatbot.
export function sendChatMessage(message) {
  return ai.post("/ai/chat", { message });
}

export default ai;
