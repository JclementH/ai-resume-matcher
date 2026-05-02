import { useEffect, useState } from "react";
import ScoreBar from "./components/Scorebar";

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

  // 🔹 validation helper
  function validate(resumeVal: string, jobVal: string): Errors {
    const newErrors: Errors = {};
    if (!resumeVal.trim()) newErrors.resume = "Resume is required.";
    if (!jobVal.trim()) newErrors.jobDescription = "Job description is required.";
    return newErrors;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const newErrors = validate(resume, jobDescription);
    setErrors(newErrors);

    // mark all as touched on submit
    setTouched({
      resume: true,
      jobDescription: true,
    });

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription })
      });

      const data = await res.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error analyzing:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("Analysis Result:", analysisResult);
  }, [analysisResult]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center px-6 py-10 gap-8">
      
      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight text-center">
        ResuMatch G
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
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              Suggestions
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 pl-2">
              {analysisResult.analysis.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}