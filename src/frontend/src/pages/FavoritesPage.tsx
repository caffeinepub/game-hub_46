import { useGetCallerUserProfile, useListGames } from '../hooks/useQueries';
import GameThumbnail from '../components/GameThumbnail';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: allGames = [], isLoading: gamesLoading } = useListGames();

  const favoriteGames = allGames.filter((game) => userProfile?.favorites.includes(game.id));

  if (profileLoading || gamesLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500 fill-red-500" />
        <h1 className="text-4xl font-bold">My Favorites</h1>
      </div>

      {favoriteGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {favoriteGames.map((game) => (
            <GameThumbnail key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground">
            Start adding games to your favorites by clicking the heart icon!
          </p>
        </div>
      )}
    </div>
  );
}
