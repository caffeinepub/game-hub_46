import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRateGame } from '../hooks/useQueries';
import { toast } from 'sonner';

interface GameRatingProps {
  gameId: string;
  currentRating: number;
  userRating?: number;
}

export default function GameRating({ gameId, currentRating, userRating }: GameRatingProps) {
  const { identity } = useInternetIdentity();
  const rateGame = useRateGame();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(userRating || 0);

  const isAuthenticated = !!identity;

  const handleRate = async (stars: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate games');
      return;
    }

    try {
      await rateGame.mutateAsync({ gameId, stars: BigInt(stars) });
      setSelectedRating(stars);
      toast.success('Rating submitted successfully');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {currentRating.toFixed(1)} average rating
        </span>
      </div>

      {isAuthenticated && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Your Rating:</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                disabled={rateGame.isPending}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= (hoveredStar || selectedRating)
                      ? 'fill-cyan-400 text-cyan-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
