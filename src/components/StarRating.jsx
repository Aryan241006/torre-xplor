import React from 'react';
import { Star } from 'lucide-react';

/**
 * Star Rating Component
 * Displays a 5-star rating based on a value from 0-5
 */
const StarRating = ({ rating, size = 16, color = 'var(--torre-accent)', showRating = true }) => {
  // Ensure rating is between 0 and 5
  const normalizedRating = Math.max(0, Math.min(5, rating));
  
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= normalizedRating;
    const isPartial = i > normalizedRating && i - 1 < normalizedRating;
    
    stars.push(
      <Star
        key={i}
        size={size}
        fill={isFilled ? color : 'transparent'}
        stroke={color}
        strokeWidth={1.5}
        style={{ 
          color: color,
          opacity: isFilled ? 1 : 0.3
        }}
      />
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars}
      </div>
      {showRating && (
        <span className="text-sm font-medium ml-2" style={{ color: 'var(--torre-text-secondary)' }}>
          {normalizedRating.toFixed(1)}/5
        </span>
      )}
    </div>
  );
};

export default StarRating;