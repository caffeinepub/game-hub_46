import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import GameThumbnail from './GameThumbnail';
import type { Game } from '../backend';

interface GameCarouselProps {
  games: Game[];
  title: string;
}

export default function GameCarousel({ games, title }: GameCarouselProps) {
  if (games.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {title}
      </h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {games.map((game) => (
            <div key={game.id} className="w-[200px] flex-shrink-0">
              <GameThumbnail game={game} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
