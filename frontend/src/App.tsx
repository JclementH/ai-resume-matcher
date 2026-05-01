import { useState } from "react";

export default function App() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");

  // TODO: Implement analyze function to call backend API and get the analysis result

  return (
    <div style={{ width: "600px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <h1>AI Resume Matcher</h1>

      <textarea
        placeholder="Paste Resume"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        rows={8}
      />

      <textarea
        placeholder="Paste Job Description"
        value={job}
        onChange={(e) => setJob(e.target.value)}
        rows={8}
      />

      <button>
        Analyze
      </button>
    </div>
  );
}