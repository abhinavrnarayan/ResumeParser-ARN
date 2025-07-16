import React from 'react';
import { AlertTriangle, CheckCircle, TrendingUp, Star } from 'lucide-react';

interface SkillGapsProps {
  matchedSkills: string[];
  missingSkills: string[];
}

const SkillGaps: React.FC<SkillGapsProps> = ({ matchedSkills, missingSkills }) => {
  const prioritySkills = missingSkills.slice(0, 5);
  const otherSkills = missingSkills.slice(5);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
        Skill Gap Analysis
      </h3>

      {/* Priority Skills to Learn */}
      <div className="mb-6">
        <h4 className="font-semibold text-red-800 mb-3 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Priority Skills to Learn
        </h4>
        <div className="space-y-2">
          {prioritySkills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-800">{skill}</span>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">High Priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Missing Skills */}
      {otherSkills.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-orange-800 mb-3">
            Other Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {otherSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Your Strengths */}
      <div>
        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Your Strengths
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {matchedSkills.map((skill, index) => (
            <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Development Roadmap */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          💡 Skill Development Roadmap
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Focus on the top 3 priority skills first</li>
          <li>• Consider online courses or bootcamps</li>
          <li>• Build projects showcasing these skills</li>
          <li>• Get certifications where applicable</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillGaps;