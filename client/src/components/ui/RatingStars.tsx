import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  starClassName?: string;
}

export function RatingStars({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  className = 'flex gap-1 items-center',
  starClassName = 'w-4 h-4'
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={className}>
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starValue = idx + 1;
        // Determine fill state
        const isFilled = displayRating >= starValue;
        const isHalf = !isFilled && displayRating >= starValue - 0.75;

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={`transition-all duration-150 focus:outline-none ${
              interactive 
                ? 'cursor-pointer hover:scale-110 active:scale-95' 
                : 'cursor-default'
            }`}
          >
            <Star
              className={`${starClassName} ${
                isFilled
                  ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.3)]'
                  : isHalf
                    ? 'text-yellow-500 fill-yellow-500/50'
                    : 'text-white/20 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
