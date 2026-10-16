
import { useState } from "react";
import { BrainCircuit, Send, FileText, LoaderCircle } from "lucide-react";
import { generateReport, sendChatMessage } from "../services/ai";

export default function AIInsights() {
  const [question, setQuestion] = useState(
    "Analyze current business performance and recommend improvements."
  );
  const [report, setReport] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  async function handleGenerateReport(event) {
    event.preventDefault();
    setReportLoading(true);
    setReportError("");
    setReport("");

    try {
      const response = await generateReport(question);
      const result = response.data;

      setReport(
        result.report ||
        result.answer ||
        result.content ||
        result.message ||
        "The service returned no report text."
      );
    } catch (error) {
      setReportError(
        error.response?.data?.detail ||
          error.message ||
          "Unable to generate report."
      );
    } finally {
      setReportLoading(false);
    }
  }

  async function handleChat(event) {
    event.preventDefault();

    const userMessage = message.trim();
    if (!userMessage || chatLoading) return;

    setChatError("");
    setChatHistory((history) => [
      ...history,
      { role: "user", content: userMessage },
    ]);
    setMessage("");
    setChatLoading(true);

    try {
      const response = await sendChatMessage(userMessage);
      const result = response.data;

      setChatHistory((history) => [
        ...history,
        {
          role: "assistant",
          content:
            result.answer ||
            result.response ||
            result.message ||
            "No response was returned.",
        },
      ]);
    } catch (error) {
      setChatError(
        error.response?.data?.detail ||
          error.message ||
          "Unable to contact the AI service."
      );
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <main className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center gap-2">
          <BrainCircuit size={28} />
          AI Business Insights
        </h2>
        <p className="text-secondary">
          Generate business reports and ask questions about ERP performance.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                <FileText size={20} className="me-2" />
                AI Report Generator
              </h5>

              <form onSubmit={handleGenerateReport}>
                <label className="form-label" htmlFor="report-question">
                  What would you like to analyze?
                </label>

                <textarea
                  id="report-question"
                  className="form-control mb-3"
                  rows={4}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  required
                  maxLength={2000}
                />

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={reportLoading || !question.trim()}
                >
                  {reportLoading ? (
                    <>
                      <LoaderCircle size={16} className="me-2" />
                      Generating...
                    </>
                  ) : (
                    "Generate Business Report"
                  )}
                </button>
              </form>

              {reportError && (
                <div className="alert alert-danger mt-3">
                  {reportError}
                </div>
              )}

              {report && (
                <div className="mt-4 p-3 bg-body-tertiary rounded-3">
                  <h6 className="fw-bold">Generated Report</h6>
                  <div style={{ whiteSpace: "pre-wrap" }}>{report}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">
                <BrainCircuit size={20} className="me-2" />
                Business Chatbot
              </h5>

              <div
                className="border rounded-3 p-3 mb-3"
                style={{ minHeight: 300, maxHeight: 450, overflowY: "auto" }}
              >
                {chatHistory.length === 0 && (
                  <div className="text-secondary">
                    <p>Try asking:</p>
                    <ul>
                      <li>Why did sales decrease this month?</li>
                      <li>Summarize current business performance.</li>
                      <li>Which business areas need improvement?</li>
                    </ul>
                  </div>
                )}

                {chatHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`mb-3 d-flex ${
                      item.role === "user"
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                  >
                    <div
                      className={`rounded-3 p-3 ${
                        item.role === "user"
                          ? "bg-primary text-white"
                          : "bg-body-tertiary"
                      }`}
                      style={{ maxWidth: "90%", whiteSpace: "pre-wrap" }}
                    >
                      <small className="d-block fw-bold mb-1">
                        {item.role === "user" ? "You" : "AI Assistant"}
                      </small>
                      {item.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <p className="text-secondary">
                    <LoaderCircle size={16} className="me-2" />
                    Analyzing your question...
                  </p>
                )}
              </div>

              {chatError && (
                <div className="alert alert-danger">{chatError}</div>
              )}

              <form onSubmit={handleChat} className="d-flex gap-2">
                <input
                  className="form-control"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Ask a business question..."
                  maxLength={2000}
                  required
                />

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={chatLoading || !message.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
