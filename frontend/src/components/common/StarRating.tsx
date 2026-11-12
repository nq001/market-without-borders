import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onRatingChange,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = rating >= starValue;
        const isHalf = !isFilled && rating >= starValue - 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-amber text-amber'
                  : isHalf
                    ? 'fill-amber/50 text-amber'
                    : 'fill-transparent text-muted/40'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

