import { useParams, Link } from '@tanstack/react-router';
import { useListGames } from '../hooks/useQueries';
import GameThumbnail from '../components/GameThumbnail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function FranchisePage() {
  const { name } = useParams({ from: '/franchise/$name' });
  const { data: allGames = [], isLoading } = useListGames();

  const franchiseGames = allGames
    .filter((game) => game.franchise.toLowerCase().includes(name.toLowerCase()))
    .sort((a, b) => Number(b.releaseYear - a.releaseYear));

  if (isLoading) {
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
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {name} Franchise
        </h1>
      </div>

      {franchiseGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {franchiseGames.map((game) => (
            <GameThumbnail key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">No games found</h2>
          <p className="text-muted-foreground">
            No games found for the {name} franchise.
          </p>
        </div>
      )}
    </div>
  );
}
