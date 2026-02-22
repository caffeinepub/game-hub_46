import { useGetCallerUserProfile, useListGames } from '../hooks/useQueries';
import GameThumbnail from '../components/GameThumbnail';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

export default function RecentlyPlayedPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: allGames = [], isLoading: gamesLoading } = useListGames();

  const recentlyPlayedGames = userProfile?.recentlyPlayed
    .map((gameId) => allGames.find((g) => g.id === gameId))
    .filter(Boolean)
    .slice(0, 20) || [];

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
        <Clock className="h-8 w-8 text-cyan-500" />
        <h1 className="text-4xl font-bold">Recently Played</h1>
      </div>

      {recentlyPlayedGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {recentlyPlayedGames.map((game) => (
            <GameThumbnail key={game!.id} game={game!} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No games played yet</h2>
          <p className="text-muted-foreground">
            Start playing games to see your history here!
          </p>
        </div>
      )}
    </div>
  );
}
