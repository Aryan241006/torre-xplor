import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Calendar, 
  Star, 
  Users, 
  Eye, 
  CheckCircle, 
  Globe, 
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Heart
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { formatDateRange } from '../utils/dataProcessing';

/**
 * UserProfileModal component for displaying detailed user information
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.user - User data to display
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 */
const UserProfileModal = ({ isOpen, onClose, user, loading, error }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Profile Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {loading && (
                <div className="p-12">
                  <LoadingSpinner size="lg" text="Loading profile details..." />
                </div>
              )}

              {error && (
                <div className="p-6">
                  <div className="text-center text-red-600">
                    <p className="text-lg font-medium mb-2">Failed to load profile</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {user && !loading && !error && (
                <div className="p-6 space-y-8">
                  {/* User Header */}
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={`${user.name}'s avatar`}
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {user.name || 'Unknown User'}
                        </h1>
                        {user.verified && (
                          <CheckCircle className="h-6 w-6 text-blue-500" />
                        )}
                      </div>

                      {user.headline && (
                        <p className="text-lg text-gray-600 mb-4">
                          {user.headline}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {user.username && (
                          <span className="text-blue-600 font-medium">
                            @{user.username}
                          </span>
                        )}
                        
                        {user.location?.name && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{user.location.name}</span>
                          </div>
                        )}

                        {user.remote && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Globe className="h-4 w-4" />
                            <span>Remote</span>
                          </div>
                        )}

                        {user.openToWork && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Briefcase className="h-4 w-4" />
                            <span>Open to work</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      {(user.stats?.connections > 0 || user.stats?.views > 0 || user.stats?.recommendations > 0) && (
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                          {user.stats.connections > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-gray-400" />
                              <span className="font-medium">{user.stats.connections}</span>
                              <span className="text-gray-500">connections</span>
                            </div>
                          )}
                          
                          {user.stats.views > 0 && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-5 w-5 text-gray-400" />
                              <span className="font-medium">{user.stats.views}</span>
                              <span className="text-gray-500">views</span>
                            </div>
                          )}
                          
                          {user.stats.recommendations > 0 && (
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-gray-400" />
                              <span className="font-medium">{user.stats.recommendations}</span>
                              <span className="text-gray-500">recommendations</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Section */}
                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Skills
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {user.skills.slice(0, 12).map((skill, index) => (
                          <div
                            key={skill.id || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {skill.name}
                            </span>
                            {skill.weight > 0 && (
                              <span className="text-sm text-blue-600 font-medium">
                                {skill.weight}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {user.skills.length > 12 && (
                        <p className="text-sm text-gray-500 mt-3">
                          +{user.skills.length - 12} more skills
                        </p>
                      )}
                    </div>
                  )}

                  {/* Strengths Section */}
                  {user.strengths && user.strengths.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Strengths
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.strengths.slice(0, 8).map((strength, index) => (
                          <span
                            key={strength.id || index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            {strength.name}
                            {strength.weight > 0 && (
                              <span className="ml-1 text-purple-600">
                                ({strength.weight})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests Section */}
                  {user.interests && user.interests.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.slice(0, 8).map((interest, index) => (
                          <span
                            key={interest.id || index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                          >
                            {interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Section */}
                  {user.experiences && user.experiences.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {user.experiences.slice(0, 5).map((exp, index) => (
                          <div
                            key={exp.id || index}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {exp.name}
                                </h4>
                                {exp.category && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {exp.category}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                  {formatDateRange(exp.fromMonth, exp.fromYear, exp.toMonth, exp.toYear)}
                                </p>
                              </div>
                              {exp.highlighted && (
                                <Star className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--torre-accent)' }} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Section */}
                  {user.education && user.education.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </h3>
                      <div className="space-y-4">
                        {user.education.slice(0, 3).map((edu, index) => (
                          <div
                            key={edu.id || index}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {edu.name}
                                </h4>
                                {edu.category && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {edu.category}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                  {formatDateRange(edu.fromMonth, edu.fromYear, edu.toMonth, edu.toYear)}
                                </p>
                              </div>
                              {edu.highlighted && (
                                <Star className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--torre-accent)' }} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages Section */}
                  {user.languages && user.languages.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        Languages
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {user.languages.map((lang, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {lang.language}
                            </span>
                            <span className="text-sm text-gray-600">
                              {lang.fluency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;
