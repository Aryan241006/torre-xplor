import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
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
  Heart,
  ExternalLink,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Link
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateRange } from '../utils/dataProcessing';

/**
 * Get the appropriate icon component for a social platform
 * @param {string} platform - Platform identifier
 * @returns {React.Component} Icon component
 */
const getPlatformIcon = (platform) => {
  const iconMap = {
    linkedin: Linkedin,
    github: Github,
    twitter: Twitter,
    instagram: Instagram,
    facebook: Facebook,
    youtube: Youtube,
    website: Link,
  };

  return iconMap[platform] || Link;
};

/**
 * GenomePage component for displaying detailed user genome information
 * @param {Object} props - Component props
 * @param {Object} props.user - User genome data to display
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onBack - Function to go back to search results
 */
const GenomePage = ({ user, loading, error, onBack }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--torre-bg-primary)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--torre-bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--torre-text-primary)' }}>
            Error Loading Genome
          </h2>
          <p className="text-lg mb-6" style={{ color: 'var(--torre-text-secondary)' }}>
            {error}
          </p>
          <button
            onClick={onBack}
            className="btn-iconoir"
          >
            <ArrowLeft size={16} />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--torre-bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--torre-text-primary)' }}>
            Genome Not Found
          </h2>
          <button
            onClick={onBack}
            className="btn-iconoir"
          >
            <ArrowLeft size={16} />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--torre-bg-primary)' }}>
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 py-4 px-6" style={{ backgroundColor: 'var(--torre-bg-primary)', borderBottom: '1px solid var(--torre-border)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              color: '#000000',
              backgroundColor: '#CDDC39',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#C0CA33';
              e.target.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#CDDC39';
              e.target.style.color = '#000000';
            }}
          >
            <ArrowLeft size={16} />
            Back to Search
          </button>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--torre-text-primary)' }}>
            {user.person?.name || 'Unknown User'}'s Genome
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="card-iconoir mb-8">
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.person?.picture ? (
                    <img
                      src={user.person.picture}
                      alt={`${user.person.name}'s avatar`}
                      className="w-32 h-32 rounded-full object-cover border-4"
                      style={{ borderColor: 'var(--torre-accent)' }}
                    />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center font-bold text-3xl"
                      style={{
                        background: 'var(--torre-accent)',
                        color: '#2d3748'
                      }}
                    >
                      {user.person?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--torre-text-primary)' }}>
                      {user.person?.name || 'Unknown User'}
                    </h1>
                    {user.person?.verified && (
                      <CheckCircle className="h-8 w-8" style={{ color: 'var(--torre-accent)' }} />
                    )}
                  </div>

                  {user.person?.professionalHeadline && (
                    <p className="text-xl mb-4" style={{ color: 'var(--torre-text-secondary)' }}>
                      {user.person.professionalHeadline}
                    </p>
                  )}

                  {user.person?.summaryOfBio && (
                    <p className="text-lg mb-6" style={{ color: 'var(--torre-text-secondary)' }}>
                      {user.person.summaryOfBio}
                    </p>
                  )}

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-6 text-sm">
                    {user.person?.location?.name && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--torre-text-muted)' }}>
                        <MapPin className="h-4 w-4" />
                        <span>{user.person.location.name}</span>
                      </div>
                    )}

                    {user.person?.openToWork && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--torre-accent)' }}>
                        <Briefcase className="h-4 w-4" />
                        <span>Open to work</span>
                      </div>
                    )}

                    {user.person?.remote && (
                      <div className="flex items-center gap-2" style={{ color: 'var(--torre-green)' }}>
                        <Globe className="h-4 w-4" />
                        <span>Remote</span>
                      </div>
                    )}
                  </div>

                  {/* Social Media Links */}
                  {user.links && user.links.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--torre-text-primary)' }}>
                        Connect
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {user.links.slice(0, 6).map((link, index) => {
                          const IconComponent = getPlatformIcon(link.platform);
                          return (
                            <a
                              key={link.id || index}
                              href={link.address}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                              style={{
                                backgroundColor: 'var(--torre-bg-tertiary)',
                                color: 'var(--torre-text-secondary)',
                                textDecoration: 'none',
                                border: '1px solid var(--torre-border)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'var(--torre-accent-light)';
                                e.target.style.borderColor = 'var(--torre-accent)';
                                e.target.style.color = 'var(--torre-accent)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'var(--torre-bg-tertiary)';
                                e.target.style.borderColor = 'var(--torre-border)';
                                e.target.style.color = 'var(--torre-text-secondary)';
                              }}
                              title={link.name || link.platform}
                            >
                              <IconComponent className="h-4 w-4" />
                              <span className="text-sm capitalize">{link.platform}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Torre Profile Link */}
                  {user.person?.username && (
                    <div className="mt-6">
                      <a
                        href={`https://torre.ai/${user.person.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--torre-accent)',
                          color: '#2d3748',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--torre-accent-dark)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'var(--torre-accent)';
                        }}
                      >
                        <ExternalLink size={16} />
                        View on Torre
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {((user.strengths && user.strengths.length > 0) || (user.skills && user.skills.length > 0) || (user.stats?.strengths && user.stats.strengths.length > 0)) && (
            <div className="card-iconoir mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--torre-text-primary)' }}>
                  <Award className="inline-block mr-2 h-6 w-6" />
                  Skills & Strengths
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(user.strengths || user.skills || user.stats?.strengths || []).slice(0, 12).map((strength, index) => (
                    <div
                      key={strength.id || index}
                      className="p-4 rounded-lg border transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--torre-bg-primary)',
                        borderColor: 'var(--torre-border)'
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: 'var(--torre-text-primary)' }}>
                        {strength.name}
                      </h3>
                      {strength.weight && (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: 'var(--torre-accent-light)',
                              width: '100%'
                            }}
                          >
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: 'var(--torre-accent)',
                                width: `${Math.min(strength.weight * 10, 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--torre-text-muted)' }}>
                            {strength.weight}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience Section */}
          {((user.experiences && user.experiences.length > 0) || (user.jobs && user.jobs.length > 0)) && (
            <div className="card-iconoir mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--torre-text-primary)' }}>
                  <Briefcase className="inline-block mr-2 h-6 w-6" />
                  Experience
                </h2>
                <div className="space-y-6">
                  {(user.experiences || user.jobs || []).slice(0, 10).map((experience, index) => (
                    <div
                      key={experience.id || index}
                      className="border-l-4 pl-6 pb-6 rounded-lg p-4 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      style={{
                        borderColor: 'var(--torre-accent)',
                        backgroundColor: 'var(--torre-bg-secondary)',
                        border: '1px solid var(--torre-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 195, 74, 0.3), 0 10px 10px -5px rgba(139, 195, 74, 0.2)';
                        e.currentTarget.style.borderColor = 'var(--torre-accent)';
                        e.currentTarget.style.backgroundColor = 'var(--torre-bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'var(--torre-border)';
                        e.currentTarget.style.backgroundColor = 'var(--torre-bg-secondary)';
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--torre-text-primary)' }}>
                            {experience.name || experience.role || 'Position'}
                          </h3>
                          {experience.organizations && experience.organizations.length > 0 && (
                            <p className="text-lg font-medium mb-2" style={{ color: 'var(--torre-accent)' }}>
                              {experience.organizations[0].name}
                            </p>
                          )}
                          {experience.category && (
                            <p className="text-sm mb-2" style={{ color: 'var(--torre-text-muted)' }}>
                              {experience.category}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end text-right">
                          {(experience.fromMonth && experience.fromYear) || experience.toMonth || experience.toYear ? (
                            <span className="text-sm font-medium" style={{ color: 'var(--torre-text-muted)' }}>
                              {formatDateRange(experience.fromMonth, experience.fromYear, experience.toMonth, experience.toYear)}
                            </span>
                          ) : (
                            <span className="text-sm" style={{ color: 'var(--torre-text-muted)' }}>
                              Unknown - Present
                            </span>
                          )}
                          {experience.remote && (
                            <span className="text-xs mt-1 px-2 py-1 rounded-full" style={{
                              backgroundColor: 'var(--torre-accent-light)',
                              color: 'var(--torre-accent)'
                            }}>
                              Remote
                            </span>
                          )}
                        </div>
                      </div>

                      {experience.summary && (
                        <p className="text-sm mb-3" style={{ color: 'var(--torre-text-secondary)' }}>
                          {experience.summary}
                        </p>
                      )}

                      {experience.responsibilities && experience.responsibilities.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--torre-text-primary)' }}>
                            Key Responsibilities:
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {experience.responsibilities.slice(0, 3).map((responsibility, idx) => (
                              <li key={idx} className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                                {responsibility}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {experience.achievements && experience.achievements.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--torre-text-primary)' }}>
                            Achievements:
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {experience.achievements.slice(0, 2).map((achievement, idx) => (
                              <li key={idx} className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education Section */}
          {user.education && user.education.length > 0 && (
            <div className="card-iconoir mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--torre-text-primary)' }}>
                  <GraduationCap className="inline-block mr-2 h-6 w-6" />
                  Education
                </h2>
                <div className="space-y-6">
                  {user.education.slice(0, 5).map((edu, index) => (
                    <div
                      key={edu.id || index}
                      className="border-l-4 pl-6 pb-6 rounded-lg p-4 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      style={{
                        borderColor: 'var(--torre-accent)',
                        backgroundColor: 'var(--torre-bg-secondary)',
                        border: '1px solid var(--torre-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 195, 74, 0.3), 0 10px 10px -5px rgba(139, 195, 74, 0.2)';
                        e.currentTarget.style.borderColor = 'var(--torre-accent)';
                        e.currentTarget.style.backgroundColor = 'var(--torre-bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'var(--torre-border)';
                        e.currentTarget.style.backgroundColor = 'var(--torre-bg-secondary)';
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--torre-text-primary)' }}>
                            {edu.name || edu.degree || 'Education'}
                          </h3>
                          {edu.organizations && edu.organizations.length > 0 && (
                            <p className="text-lg font-medium mb-2" style={{ color: 'var(--torre-accent)' }}>
                              {edu.organizations[0].name}
                            </p>
                          )}
                          {edu.category && (
                            <p className="text-sm mb-2" style={{ color: 'var(--torre-text-muted)' }}>
                              {edu.category}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {(edu.fromMonth && edu.fromYear) || edu.toMonth || edu.toYear ? (
                            <span className="text-sm font-medium" style={{ color: 'var(--torre-text-muted)' }}>
                              {formatDateRange(edu.fromMonth, edu.fromYear, edu.toMonth, edu.toYear)}
                            </span>
                          ) : (
                            <span className="text-sm" style={{ color: 'var(--torre-text-muted)' }}>
                              Unknown - Present
                            </span>
                          )}
                        </div>
                      </div>

                      {edu.summary && (
                        <p className="text-sm mb-3" style={{ color: 'var(--torre-text-secondary)' }}>
                          {edu.summary}
                        </p>
                      )}

                      {edu.field && (
                        <p className="text-sm" style={{ color: 'var(--torre-text-secondary)' }}>
                          <strong>Field of Study:</strong> {edu.field}
                        </p>
                      )}

                      {edu.grade && (
                        <p className="text-sm mt-1" style={{ color: 'var(--torre-text-secondary)' }}>
                          <strong>Grade:</strong> {edu.grade}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Languages Section */}
          {user.languages && user.languages.length > 0 && (
            <div className="card-iconoir mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--torre-text-primary)' }}>
                  <Languages className="inline-block mr-2 h-6 w-6" />
                  Languages
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.languages.map((language, index) => (
                    <div
                      key={language.id || index}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--torre-bg-primary)',
                        borderColor: 'var(--torre-border)'
                      }}
                    >
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--torre-text-primary)' }}>
                        {language.language}
                      </h3>
                      {language.fluency && (
                        <p className="text-sm" style={{ color: 'var(--torre-text-muted)' }}>
                          {language.fluency}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GenomePage;
