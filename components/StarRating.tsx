import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  editable?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  onRatingChange, 
  size = 16, 
  editable = false 
}) => {
  return (
    <div className="flex items-center space-x-0.5">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= (rating || 0);

        return (
          <button
            key={index}
            type="button"
            disabled={!editable}
            onClick={() => editable && onRatingChange && onRatingChange(starValue)}
            className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star 
              size={size} 
              className={`${isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} 
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
