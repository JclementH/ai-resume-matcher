import { useEffect, useState } from "react";

interface AnalysisResult {
  analysis: {
    education_match: { score: number; explanation: string };
    experience_match: { score: number; explanation: string };
    skills_match: { score: number; explanation: string };
    overall_match: { score: number; explanation: string };
    suggestions: string[];
  };
}

export default function App() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
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
          <textarea
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 
            focus:outline-none focus:ring-2 focus:ring-yellow-500 
            placeholder-gray-500 resize-none"
            placeholder="Paste Resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={10}
          />

          <textarea
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 
            focus:outline-none focus:ring-2 focus:ring-yellow-500 
            placeholder-gray-500 resize-none"
            placeholder="Paste Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
          />
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
      {analysisResult && (
        <div className="w-full max-w-5xl bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 shadow-lg">
          
          <h2 className="text-2xl font-semibold tracking-tight">
            Analysis Result
          </h2>

          {/* Score Cards */}
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
                className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-2"
              >
                <h3 className="font-semibold">{label}</h3>
                <p className="text-yellow-400 text-2xl font-bold">
                  {data.score}
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {data.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Suggestions */}
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