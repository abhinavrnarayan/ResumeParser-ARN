import React from 'react';
import { Lightbulb, Target, Edit, Award, ArrowRight } from 'lucide-react';

interface OptimizationTipsProps {
  recommendations: string[];
  score: number;
}

const OptimizationTips: React.FC<OptimizationTipsProps> = ({ recommendations, score }) => {
  const getImpactLevel = (index: number) => {
    if (index < 2) return { label: 'High Impact', color: 'red', icon: '🔥' };
    if (index < 4) return { label: 'Medium Impact', color: 'yellow', icon: '⚡' };
    return { label: 'Low Impact', color: 'green', icon: '💡' };
  };

  const quickWins = [
    'Use job-specific keywords throughout your resume',
    'Quantify achievements with numbers and percentages',
    'Include relevant certifications and courses',
    'Tailor your professional summary to the role'
  ];

  const longTermStrategies = [
    'Build a portfolio showcasing relevant projects',
    'Network with professionals in your target industry',
    'Contribute to open-source projects',
    'Write technical blog posts or articles'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
        Optimization Recommendations
      </h3>

      {/* Score-based Alert */}
      <div className={`p-4 rounded-lg mb-6 ${
        score >= 80 ? 'bg-green-50 border border-green-200' :
        score >= 60 ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center">
          <Target className={`h-5 w-5 mr-2 ${
            score >= 80 ? 'text-green-600' :
            score >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`} />
          <span className={`font-medium ${
            score >= 80 ? 'text-green-800' :
            score >= 60 ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            {score >= 80 ? 'Excellent! Minor optimizations needed' :
             score >= 60 ? 'Good foundation, focus on key improvements' :
             'Significant optimization required for better matching'}
          </span>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Edit className="h-5 w-5 mr-2" />
          Personalized Action Items
        </h4>
        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const impact = getImpactLevel(index);
            return (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <span className="text-lg mr-3">{impact.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-800">{rec}</p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                    impact.color === 'red' ? 'bg-red-100 text-red-700' :
                    impact.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {impact.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Wins */}
      <div className="mb-6">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <ArrowRight className="h-5 w-5 mr-2" />
          Quick Wins (This Week)
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {quickWins.map((tip, index) => (
            <div key={index} className="flex items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-blue-800 text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Long-term Strategies */}
      <div>
        <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Long-term Strategies
        </h4>
        <div className="space-y-2">
          {longTermStrategies.map((strategy, index) => (
            <div key={index} className="flex items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-purple-600 mr-2">→</span>
              <span className="text-purple-800 text-sm">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">
          📊 Success Metrics to Track
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Target Match Score:</p>
            <p className="font-bold text-blue-600">85%+</p>
          </div>
          <div>
            <p className="text-gray-600">Keyword Density:</p>
            <p className="font-bold text-green-600">90%+</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationTips;