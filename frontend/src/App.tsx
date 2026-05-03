import { useState } from "react";
import ScoreBar from "./components/ScoreBar";
import SuggestionCard from "./components/SuggestionCard";

type SavedAnalysis = {
  id: string;
  date: string;
  resume: string;
  jobDescription: string;
  analysis: AnalysisResult;
};

interface AnalysisResult {
  analysis: {
    education_match: { score: number; explanation: string };
    experience_match: { score: number; explanation: string };
    skills_match: { score: number; explanation: string };
    overall_match: { score: number; explanation: string };
    suggestions: string[];
  };
}

interface Errors {
  resume?: string;
  jobDescription?: string;
}


export default function App() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState({
    resume: false,
    jobDescription: false,
  });
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  function validate(resumeVal: string, jobVal: string): Errors {
    const newErrors: Errors = {};
    if (!resumeVal.trim()) newErrors.resume = "Resume is required.";
    if (!jobVal.trim()) newErrors.jobDescription = "Job description is required.";
    return newErrors;
  }

  async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000
  ): Promise<Response> {
    try {
      const res = await fetch(url, options);
      if (!res.ok && res.status >= 500) {
        throw new Error(`Server error: ${res.status}`);
      }
      return res;
    } catch (err) {
      if (retries <= 0) throw err;
      console.warn(`Retrying... attempts left: ${retries}`);
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
  }

  async function runAnalysis() {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetchWithRetry(
        "https://resmatch-g.onrender.com/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, jobDescription }),
        }
      );

      const data = await res.json();
      setAnalysisResult(data);
      saveToHistory(data);

    } catch (error) {
      setServerError("Unable to analyze right now. Please try again.");
      console.log("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = validate(resume, jobDescription);
    setErrors(newErrors);
    setTouched({ resume: true, jobDescription: true });

    if (Object.keys(newErrors).length > 0) return;

    runAnalysis();
  }

  function saveToHistory(result: AnalysisResult) {
    const newEntry: SavedAnalysis = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString(),
      resume,
      jobDescription,
      analysis: result,
    };    

    const updated = [newEntry, ...history].slice(0, 10);

    setHistory(updated);
    localStorage.setItem("analysis_history", JSON.stringify(updated));
  }

  function restoreFromHistory(item: SavedAnalysis) {
    setResume(item.resume);
    setJobDescription(item.jobDescription);
    setAnalysisResult(item.analysis);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-6 py-10 gap-8">
      
      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight text-center">
        ResMatch G
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl flex flex-col gap-6"
      >

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Resume */}
          <div className="flex flex-col gap-1">
            <textarea
              className={`bg-gray-900 border rounded-xl p-4 resize-none
              focus:outline-none focus:ring-2
              ${
                touched.resume && errors.resume
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-800 focus:ring-yellow-500"
              }`}
              placeholder="Paste Resume"
              value={resume}
              onChange={(e) => {
                const value = e.target.value;
                setResume(value);

                const newErrors = validate(value, jobDescription);
                setErrors(newErrors);
              }}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, resume: true }))
              }
              rows={10}
            />
            {touched.resume && errors.resume && (
              <p className="text-sm text-red-400">{errors.resume}</p>
            )}
          </div>

          {/* Job Description */}
          <div className="flex flex-col gap-1">
            <textarea
              className={`bg-gray-900 border rounded-xl p-4 resize-none
              focus:outline-none focus:ring-2
              ${
                touched.jobDescription && errors.jobDescription
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-800 focus:ring-yellow-500"
              }`}
              placeholder="Paste Job Description"
              value={jobDescription}
              onChange={(e) => {
                const value = e.target.value;
                setJobDescription(value);

                const newErrors = validate(resume, value);
                setErrors(newErrors);
              }}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  jobDescription: true,
                }))
              }
              rows={10}
            />
            {touched.jobDescription && errors.jobDescription && (
              <p className="text-sm text-red-400">
                {errors.jobDescription}
              </p>
            )}
          </div>

        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-500 text-black hover:bg-yellow-400 
          transition rounded-xl py-3 font-semibold 
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {serverError && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-xl p-3 text-sm">
            {serverError}
          </div>
        )}

        {serverError && (
          <button
            type="button"
            onClick={runAnalysis}
            className="text-sm text-yellow-400 hover:underline"
          >
            Try again
          </button>
        )}
      </form>

      {/* Results */}
      {analysisResult && !loading && (
        <div className="w-full max-w-5xl bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 shadow-lg">
          
          <h2 className="text-2xl font-semibold tracking-tight">
            Analysis Result
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {(
              [
                ["Education", analysisResult.analysis.education_match],
                ["Experience", analysisResult.analysis.experience_match],
                ["Skills", analysisResult.analysis.skills_match],
                ["Overall", analysisResult.analysis.overall_match],
              ] as [string, { score: number; explanation: string }][]
            ).map(([label, data]) => (
              <div
                key={label}
                className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3"
              >
                <h3 className="font-semibold">{label}</h3>
                <p
                  className={`text-2xl font-bold ${
                    data.score < 40
                      ? "text-red-400"
                      : data.score < 70
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {data.score}
                </p>

                <ScoreBar score={data.score} />
                <p className="text-sm text-gray-400 leading-relaxed">
                  {data.explanation}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">
              Suggestions
            </h3>
            <div className="grid gap-3">
              {analysisResult.analysis.suggestions.map((s, i) => (
                <SuggestionCard key={i} text={s} />
              ))}
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="w-full max-w-5xl mt-10 space-y-4">
          
          <h2 className="text-xl font-semibold text-gray-100">
            History
          </h2>

          <div className="grid gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => restoreFromHistory(item)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 cursor-pointer hover:border-gray-600 transition"
              >
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{item.date}</span>
                  <span>
                    Score: {item.analysis.analysis.overall_match.score}
                  </span>
                </div>

                <p className="text-gray-300 text-sm line-clamp-2">
                  {item.jobDescription}
                </p>

                <p className="text-xs text-gray-500">
                  Click to restore
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}