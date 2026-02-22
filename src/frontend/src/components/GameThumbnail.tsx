import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import FavoriteButton from './FavoriteButton';
import type { Game } from '../backend';

interface GameThumbnailProps {
  game: Game;
}

export default function GameThumbnail({ game }: GameThumbnailProps) {
  const imageUrl = game.coverImage
    ? game.coverImage.getDirectURL()
    : '/assets/generated/game-placeholder.dim_400x500.png';

  return (
    <Link
      to="/game/$gameId"
      params={{ gameId: game.id }}
      className="group relative block rounded-lg overflow-hidden bg-card border border-border/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img
          src={imageUrl}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton gameId={game.id} />
        </div>
        {game.isNew && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
            NEW
          </Badge>
        )}
        {game.trending && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
            TRENDING
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 mb-1">{game.title}</h3>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {game.genre}
          </Badge>
          <span className="text-xs text-muted-foreground">{game.releaseYear.toString()}</span>
        </div>
      </div>
    </Link>
  );
}
