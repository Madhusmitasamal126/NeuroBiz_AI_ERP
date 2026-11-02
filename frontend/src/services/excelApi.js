
const AI_API_URL = (
  import.meta.env.VITE_AI_API_URL ||
  "http://127.0.0.1:9000"
).replace(/\/+$/, "");

function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("access")
  );
}

async function uploadFile(endpoint, file) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Please log in before uploading a file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${AI_API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.detail || `Request failed (${response.status})`
    );
  }

  return response;
}

export async function analyzeExcel(file) {
  const response = await uploadFile("/excel/analyze", file);
  return response.json();
}

export async function downloadExcelReport(file) {
  const response = await uploadFile("/excel/report", file);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "neurobiz_sales_report.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Delay cleanup so the browser can begin the download.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}
