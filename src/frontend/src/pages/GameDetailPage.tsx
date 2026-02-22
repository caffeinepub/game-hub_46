import { useParams, Link } from '@tanstack/react-router';
import { useGetGame, useListGames, usePlayGame } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Calendar, User, Monitor, ArrowLeft } from 'lucide-react';
import FavoriteButton from '../components/FavoriteButton';
import GameRating from '../components/GameRating';
import CommentsSection from '../components/CommentsSection';
import GameCarousel from '../components/GameCarousel';
import { toast } from 'sonner';
import { useMemo } from 'react';

export default function GameDetailPage() {
  const { gameId } = useParams({ from: '/game/$gameId' });
  const { data: game, isLoading } = useGetGame(gameId);
  const { data: allGames = [] } = useListGames();
  const playGame = usePlayGame();

  const relatedGames = useMemo(() => {
    if (!game) return [];
    return allGames
      .filter((g) => g.id !== game.id && (g.genre === game.genre || g.franchise === game.franchise))
      .slice(0, 10);
  }, [game, allGames]);

  const handlePlay = async () => {
    try {
      await playGame.mutateAsync(gameId);
      toast.success('Game launched! Play count updated.');
    } catch (error) {
      toast.error('Failed to launch game');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Game not found</h1>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const imageUrl = game.coverImage
    ? game.coverImage.getDirectURL()
    : '/assets/generated/game-placeholder.dim_400x500.png';

  return (
    <article className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-b from-card to-background">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative container h-full flex items-end pb-8">
          <Link to="/">
            <Button variant="ghost" className="absolute top-4 left-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-end w-full">
            <img
              src={imageUrl}
              alt={game.title}
              className="w-64 h-80 object-cover rounded-lg shadow-2xl border-2 border-border"
            />
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{game.title}</h1>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                      {game.genre}
                    </Badge>
                    {game.trending && (
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        TRENDING
                      </Badge>
                    )}
                    {game.isNew && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        NEW
                      </Badge>
                    )}
                  </div>
                </div>
                <FavoriteButton gameId={game.id} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {game.releaseYear.toString()}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {game.developer}
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  {game.platform}
                </div>
              </div>
              <Button
                size="lg"
                onClick={handlePlay}
                disabled={playGame.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/50"
              >
                <Play className="h-5 w-5 mr-2" />
                {playGame.isPending ? 'Launching...' : 'Play Now'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 space-y-12">
        {/* Description */}
        <section className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-muted-foreground leading-relaxed">{game.description}</p>
          {game.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {game.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </section>

        {/* Rating */}
        <section className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Rating</h2>
          <GameRating gameId={game.id} currentRating={game.rating} />
        </section>

        {/* Related Games */}
        {relatedGames.length > 0 && (
          <section>
            <GameCarousel games={relatedGames} title="Related Games" />
          </section>
        )}

        {/* Comments */}
        <section className="max-w-4xl">
          <CommentsSection gameId={game.id} />
        </section>
      </div>
    </article>
  );
}
