import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useUpdateFavorites } from '../hooks/useQueries';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  gameId: string;
}

export default function FavoriteButton({ gameId }: FavoriteButtonProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const updateFavorites = useUpdateFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const isAuthenticated = !!identity;
  const isFavorited = userProfile?.favorites.includes(gameId) || false;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      await updateFavorites.mutateAsync({ gameId, add: !isFavorited });
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={!isAuthenticated}
      className={`h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur transition-all ${
        isAnimating ? 'scale-125' : 'scale-100'
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-all ${
          isFavorited ? 'fill-red-500 text-red-500' : 'text-white'
        }`}
      />
    </Button>
  );
}
