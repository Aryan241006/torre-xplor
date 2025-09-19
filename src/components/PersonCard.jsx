import React from 'react';
import { MapPin, Star, Users, Eye, CheckCircle, Globe, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import ComparisonButton from './ComparisonButton.jsx';

/**
 * PersonCard component to display individual person information
 * @param {Object} props - Component props
 * @param {Object} props.person - Person data
 * @param {Function} props.onClick - Click handler
 * @param {number} props.index - Card index for animation delay
 */
const PersonCard = ({ 
  person, 
  onClick, 
  index = 0, 
  showAddButton = false, 
  compact = false,
  selectButtonText = "View Genome",
  isExcluded = false
}) => {
  if (!person || isExcluded) return null;

  const handleClick = () => {
    onClick(person);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(person);
    }
  };

  // Get top skills (limit to 3 for card display)
  const topSkills = person.skills?.slice(0, 3) || [];
  const remainingSkillsCount = Math.max(0, (person.skills?.length || 0) - 3);

  // Format location display
  const locationDisplay = person.location?.name || person.location?.shortName || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.2, 
        delay: Math.min(index * 0.03, 0.5), // Faster stagger, max 0.5s delay
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="card-iconoir cursor-pointer overflow-hidden"
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View genome of ${person.name}`}
    >
      <div className={`${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"} h-full flex flex-col`}>
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {person.picture ? (
              <img
                src={person.picture}
                alt={`${person.name}'s avatar`}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2"
                style={{ borderColor: 'var(--torre-border)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-semibold text-base sm:text-lg ${person.picture ? 'hidden' : 'flex'}`}
              style={{
                background: 'var(--torre-accent)',
                color: '#2d3748'
              }}
            >
              {person.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>

          {/* Name and Headline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold truncate" style={{ color: 'var(--torre-text-primary)' }}>
                {person.name || 'Unknown User'}
              </h3>
              {person.verified && (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: 'var(--torre-accent)' }} />
              )}
            </div>

            {person.headline && (
              <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--torre-text-secondary)' }}>
                {person.headline}
              </p>
            )}

            {/* Username */}
            {person.username && (
              <p className="text-sm font-medium" style={{ color: 'var(--torre-accent)' }}>
                @{person.username}
              </p>
            )}
          </div>
        </div>

        {/* Location and Status Indicators */}
        <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: 'var(--torre-text-muted)' }}>
          {locationDisplay && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{locationDisplay}</span>
            </div>
          )}

          {person.remote && (
            <div className="flex items-center gap-1" style={{ color: 'var(--torre-green)' }}>
              <Globe className="h-4 w-4" />
              <span>Remote</span>
            </div>
          )}

          {person.openToWork && (
            <div className="flex items-center gap-1" style={{ color: 'var(--torre-accent)' }}>
              <Briefcase className="h-4 w-4" />
              <span>Open to work</span>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="flex-1">
          {topSkills.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {topSkills.map((skill, skillIndex) => (
                  <span
                    key={skill.id || skillIndex}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--torre-accent-light)',
                      color: 'var(--torre-accent)',
                      border: '1px solid var(--torre-accent)'
                    }}
                  >
                    {skill.name}
                    {skill.weight > 0 && (
                      <span className="ml-1" style={{ color: 'var(--torre-accent)' }}>
                        ({skill.weight})
                      </span>
                    )}
                  </span>
                ))}
                {remainingSkillsCount > 0 && (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--torre-bg-tertiary)',
                      color: 'var(--torre-text-muted)'
                    }}
                  >
                    +{remainingSkillsCount} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm pt-4 mt-auto"
             style={{
               color: 'var(--torre-text-muted)',
               borderTop: '1px solid var(--torre-border)'
             }}>
          <div className="flex items-center gap-4">
            {person.stats?.connections > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{person.stats.connections}</span>
              </div>
            )}
            
            {person.stats?.views > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{person.stats.views}</span>
              </div>
            )}
            
            {person.stats?.recommendations > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{person.stats.recommendations}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <ComparisonButton person={person} size="sm" showLabel={showAddButton ? true : false} />
            {!showAddButton && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-medium text-sm transition-colors duration-200"
                style={{ color: 'var(--torre-accent)' }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--torre-accent-dark)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--torre-accent)';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(person);
                }}
              >
                {selectButtonText}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonCard;
