import { useState, useMemo } from 'react';
import { useListGames } from '../hooks/useQueries';
import SearchBar from '../components/SearchBar';
import GameFilters from '../components/GameFilters';
import GameCarousel from '../components/GameCarousel';
import GameThumbnail from '../components/GameThumbnail';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data: games = [], isLoading } = useListGames();
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [franchise, setFranchise] = useState('');
  const [sport, setSport] = useState('');

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch =
        !searchTerm ||
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGenre = !genre || game.genre === genre;
      const matchesYear = !year || game.releaseYear.toString() === year;
      const matchesFranchise = !franchise || game.franchise.toLowerCase().includes(franchise.toLowerCase());
      const matchesSport = !sport || game.sport.toLowerCase().includes(sport.toLowerCase());

      return matchesSearch && matchesGenre && matchesYear && matchesFranchise && matchesSport;
    });
  }, [games, searchTerm, genre, year, franchise, sport]);

  const trendingGames = useMemo(() => {
    return games.filter((g) => g.trending).slice(0, 10);
  }, [games]);

  const newGames = useMemo(() => {
    return games
      .filter((g) => g.isNew)
      .sort((a, b) => Number(b.releaseYear - a.releaseYear))
      .slice(0, 10);
  }, [games]);

  const popularGames = useMemo(() => {
    return [...games].sort((a, b) => Number(b.playCount - a.playCount)).slice(0, 10);
  }, [games]);

  const clearFilters = () => {
    setGenre('');
    setYear('');
    setFranchise('');
    setSport('');
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1920x600.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="relative z-10 container text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Game Hub
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
            Discover and play 500+ amazing games across all genres
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search 500+ games..." />
          </div>
        </div>
      </section>

      <div className="container py-8 space-y-12">
        {/* Filters */}
        <section>
          <GameFilters
            genre={genre}
            year={year}
            franchise={franchise}
            sport={sport}
            onGenreChange={setGenre}
            onYearChange={setYear}
            onFranchiseChange={setFranchise}
            onSportChange={setSport}
            onClear={clearFilters}
          />
        </section>

        {/* Search Results or Curated Sections */}
        {searchTerm || genre || year || franchise || sport ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">
              Search Results ({filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames.map((game) => (
                <GameThumbnail key={game.id} game={game} />
              ))}
            </div>
            {filteredGames.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                No games found. Try adjusting your filters.
              </p>
            )}
          </section>
        ) : (
          <>
            <GameCarousel games={trendingGames} title="🔥 Trending Now" />
            <GameCarousel games={newGames} title="✨ New Releases" />
            <GameCarousel games={popularGames} title="⭐ Most Popular" />

            {/* All Games Grid */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                All Games
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {games.slice(0, 50).map((game) => (
                  <GameThumbnail key={game.id} game={game} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
