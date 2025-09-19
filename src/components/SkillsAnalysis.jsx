import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Users, Target } from 'lucide-react';
import { analyzeTrendingSkills } from '../services/api';

/**
 * SkillsAnalysis component for displaying skill trends and analysis
 * @param {Object} props - Component props
 * @param {Array} props.searchResults - Array of search results to analyze
 * @param {string} props.query - Current search query
 * @param {boolean} props.visible - Whether the analysis is visible
 */
const SkillsAnalysis = ({ searchResults = [], query = '', visible = false }) => {
  // Analyze skills from search results
  const analysis = useMemo(() => {
    if (!searchResults.length) return null;
    return analyzeTrendingSkills(searchResults);
  }, [searchResults]);

  if (!visible || !analysis || searchResults.length === 0) {
    return null;
  }

  const { topSkills, topStrengths, totalPeople, analysis: stats } = analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Skills Analysis
          </h2>
          <p className="text-sm text-gray-600">
            Based on {totalPeople} professionals matching "{query}"
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total People</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalPeople}</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Unique Skills</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.skillDiversity || 0}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Top Skill</span>
          </div>
          <p className="text-lg font-bold text-purple-900 truncate">
            {stats.mostPopularSkill || 'N/A'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Top Strength</span>
          </div>
          <p className="text-lg font-bold text-orange-900 truncate">
            {stats.mostPopularStrength || 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Skills */}
        {topSkills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Most Common Skills
            </h3>
            <div className="space-y-3">
              {topSkills.map((skill, index) => {
                const percentage = totalPeople > 0 ? (skill.count / totalPeople) * 100 : 0;
                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {skill.name}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{skill.count}</span>
                        <span className="text-xs">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Strengths */}
        {topStrengths.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Most Common Strengths
            </h3>
            <div className="space-y-3">
              {topStrengths.map((strength, index) => {
                const percentage = totalPeople > 0 ? (strength.count / totalPeople) * 100 : 0;
                return (
                  <motion.div
                    key={strength.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {strength.name}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{strength.count}</span>
                        <span className="text-xs">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {(topSkills.length > 0 || topStrengths.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Key Insights
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            {topSkills.length > 0 && (
              <p>
                • <strong>{topSkills[0].name}</strong> is the most common skill, found in{' '}
                {((topSkills[0].count / totalPeople) * 100).toFixed(1)}% of profiles
              </p>
            )}
            {topStrengths.length > 0 && (
              <p>
                • <strong>{topStrengths[0].name}</strong> is the most common strength among these professionals
              </p>
            )}
            {stats.skillDiversity > 10 && (
              <p>
                • High skill diversity with {stats.skillDiversity} unique skills across all profiles
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SkillsAnalysis;
