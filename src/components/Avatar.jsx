import React from 'react';

/**
 * Avatar component with fallback to initials
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL (takes priority)
 * @param {string} props.name - Person's name for fallback initials
 * @param {Object} props.person - Person object with picture and name
 * @param {string} props.size - Size class (w-8 h-8, w-12 h-12, etc.)
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({ src, name, person, size = 'w-8 h-8', className = '' }) => {
  // Support both direct props and person object
  const imageSource = src || person?.picture;
  const personName = name || person?.name;
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeMap = {
    'xs': 'w-6 h-6 text-xs',
    'sm': 'w-8 h-8 text-xs', 
    'lg': 'w-16 h-16 text-lg',
  };
  
  const actualSize = sizeMap[size] || size;

  return (
    <div className={`${actualSize} rounded-full flex items-center justify-center relative ${className}`}>
      {imageSource ? (
        <img
          src={imageSource}
          alt={personName}
          className={`${actualSize} rounded-full object-cover`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className={`${actualSize} rounded-full flex items-center justify-center font-semibold absolute inset-0`}
        style={{ 
          backgroundColor: 'var(--torre-accent)',
          color: '#000000',
          display: imageSource ? 'none' : 'flex'
        }}
      >
        {getInitials(personName)}
      </div>
    </div>
  );
};

export default Avatar;
