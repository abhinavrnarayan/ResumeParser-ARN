import React from 'react';
import { TrendingUp, Target, BarChart3, Award } from 'lucide-react';

interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordDensity: number;
  textSimilarity: number;
  recommendations: string[];
}

interface MatchResultsProps {
  result: MatchResult;
}

const MatchResults: React.FC<MatchResultsProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(result.score)} rounded-full`}
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${100 - result.score}%, 0 ${100 - result.score}%)`
              }}
            />
            <div className="relative z-10 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className="text-sm text-gray-600">Match</div>
            </div>
          </div>
        </div>
        
        <h3 className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
          {getScoreLabel(result.score)}
        </h3>
        <p className="text-gray-600 mt-2">
          Your resume matches {result.score}% of the job requirements
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {result.matchedSkills.length}
            </span>
          </div>
          <p className="text-blue-800 font-medium">Matched Skills</p>
          <p className="text-blue-600 text-sm">Skills you already have</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-6 w-6 text-red-600" />
            <span className="text-2xl font-bold text-red-600">
              {result.missingSkills.length}
            </span>
          </div>
          <p className="text-red-800 font-medium">Missing Skills</p>
          <p className="text-red-600 text-sm">Skills to develop</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-2xl font-bold text-green-600">
              {result.textSimilarity}%
            </span>
          </div>
          <p className="text-purple-800 font-medium">Text Similarity</p>
          <p className="text-purple-600 text-sm">AI semantic analysis</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getScoreGradient(result.score)} transition-all duration-1000 ease-out`}
          style={{ width: `${result.score}%` }}
        />
      </div>

      {/* Matched Skills */}
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Matched Skills ({result.matchedSkills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {result.matchedSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchResults;