import React, { useState } from "react";
import {
  Upload,
  FileText,
  Briefcase,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download,
  Server,
} from "lucide-react";
import FileUpload from "./components/FileUpload";
import MatchResults from "./components/MatchResults";
import SkillGaps from "./components/SkillGaps";
import OptimizationTips from "./components/OptimizationTips";

interface ParsedData {
  fileName: string;
  text: string;
  skills: string[];
  experience: string[];
  education: string[];
  keywords: string[];
}

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordDensity: number;
  textSimilarity: number;
  recommendations: string[];
}

const API_BASE_URL = "/api";

function App() {
  const [resume, setResume] = useState<ParsedData | null>(null);
  const [jobDesc, setJobDesc] = useState<ParsedData | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );

  // Check API status on component mount
  React.useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setApiStatus("online");
      } else {
        setApiStatus("offline");
      }
    } catch (error) {
      setApiStatus("offline");
    }
  };

  const handleFileUpload = async (file: File, type: "resume" | "job") => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/parse`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const parsedData: ParsedData = await response.json();

      if (type === "resume") {
        setResume(parsedData);
      } else {
        setJobDesc(parsedData);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(
        "Error processing file. Please make sure the Python backend is running."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateMatch = async () => {
    if (!resume || !jobDesc) return;

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_data: resume,
          job_data: jobDesc,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: MatchResult = await response.json();
      setMatchResult(result);
    } catch (error) {
      console.error("Error calculating match:", error);
      alert(
        "Error calculating match. Please make sure the Python backend is running."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResults = () => {
    if (!matchResult) return;

    const report = {
      timestamp: new Date().toISOString(),
      matchScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      keywordDensity: matchResult.keywordDensity,
      textSimilarity: matchResult.textSimilarity,
      recommendations: matchResult.recommendations,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-match-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Resume Parser & Job Matcher
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4"></p>

          {/* API Status Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Server className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">Backend Status:</span>
            <div
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                apiStatus === "online"
                  ? "bg-green-100 text-green-800"
                  : apiStatus === "offline"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  apiStatus === "online"
                    ? "bg-green-500"
                    : apiStatus === "offline"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
              <span>
                {apiStatus === "online"
                  ? "Online"
                  : apiStatus === "offline"
                  ? "Offline"
                  : "Checking..."}
              </span>
            </div>
          </div>

          {apiStatus === "offline" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <div className="text-left">
                  <p className="text-red-800 font-medium">
                    Python Backend Not Running
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    Please start the backend server:{" "}
                    <code className="bg-red-100 px-1 rounded">
                      cd backend && python main.py
                    </code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <FileUpload
            title="Upload Resume"
            subtitle="PDF or DOCX format"
            icon={FileText}
            onFileUpload={(file) => handleFileUpload(file, "resume")}
            isProcessing={isProcessing}
            uploadedFile={resume}
            disabled={apiStatus !== "online"}
          />

          <FileUpload
            title="Upload Job Description"
            subtitle="PDF or DOCX format"
            icon={Briefcase}
            onFileUpload={(file) => handleFileUpload(file, "job")}
            isProcessing={isProcessing}
            uploadedFile={jobDesc}
            disabled={apiStatus !== "online"}
          />
        </div>

        {resume && jobDesc && apiStatus === "online" && (
          <div className="text-center mb-12">
            <button
              onClick={calculateMatch}
              disabled={isProcessing}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing with AI...
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Calculate AI Match Score
                </>
              )}
            </button>
          </div>
        )}

        {matchResult && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  AI Match Results
                </h2>
                <button
                  onClick={exportResults}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
              <MatchResults result={matchResult} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SkillGaps
                matchedSkills={matchResult.matchedSkills}
                missingSkills={matchResult.missingSkills}
              />

              <OptimizationTips
                recommendations={matchResult.recommendations}
                score={matchResult.score}
              />
            </div>

            {/* Technical Details */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🔬 Technical Analysis Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-600">Text Similarity</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {matchResult.textSimilarity}%
                  </p>
                  <p className="text-gray-500">TF-IDF + Cosine Similarity</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-600">Keyword Density</p>
                  <p className="text-2xl font-bold text-green-600">
                    {matchResult.keywordDensity}%
                  </p>
                  <p className="text-gray-500">NLP Keyword Extraction</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-600">Skills Matched</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {matchResult.matchedSkills.length}
                  </p>
                  <p className="text-gray-500">Pattern Recognition</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
