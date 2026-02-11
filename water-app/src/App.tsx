import { useState } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Droplets,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface AnalysisResult {
  average_kld: number;
  daily_exceed_count: number;
  daily_violation_details: { date: string; value: number }[];
  average_kly: number;
  annual_exceed_count: number;
  annual_violation_details: { year: number; total: number }[];
  trend_slope: number;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
  method: "POST",
  body: formData,
});
;

      if (!response.ok) {
        throw new Error("Failed to analyze file");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-800 flex flex-col items-center p-8">
      <div className="w-full max-w-6xl">

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-12"
        >
          <Droplets size={40} className="text-cyan-400" />
          <h1 className="text-4xl font-bold text-white tracking-wide">
            Water Extraction Compliance Analyzer
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 w-full max-w-xl"
        >
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-400 rounded-xl p-8 cursor-pointer hover:bg-white/5 transition">
            <UploadCloud size={40} className="text-cyan-400 mb-4" />
            <span className="text-white text-lg font-medium">
              {file ? file.name : "Click to upload Excel file"}
            </span>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {error && (
            <p className="text-red-400 mt-4 text-center">{error}</p>
          )}
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl"
          >
            <ResultCard title="Average KLD" value={result.average_kld} />
            <ResultCard title="Average KLY" value={result.average_kly} />

            <ResultCard
              title="Daily Violations"
              value={result.daily_exceed_count}
              danger={result.daily_exceed_count > 0}
            />

            <ResultCard
              title="Annual Violations"
              value={result.annual_exceed_count}
              danger={result.annual_exceed_count > 0}
            />

            <motion.div className="bg-white/10 p-6 rounded-2xl flex items-center justify-between col-span-full">
              <div>
                <h3 className="text-lg text-white">Trend</h3>
                <p className="text-2xl font-bold text-white">
                  {result.trend_slope.toFixed(4)}
                </p>
              </div>
              {result.trend_slope > 0 ? (
                <TrendingUp size={40} className="text-green-400" />
              ) : (
                <TrendingDown size={40} className="text-red-400" />
              )}
            </motion.div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

function ResultCard({
  title,
  value,
  danger,
}: {
  title: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-white/10 p-6 rounded-2xl shadow-lg border ${
        danger ? "border-red-500" : "border-white/20"
      }`}
    >
      <h3 className="text-lg text-white mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

export default App;
