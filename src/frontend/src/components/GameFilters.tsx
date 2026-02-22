import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface GameFiltersProps {
  genre: string;
  year: string;
  franchise: string;
  sport: string;
  onGenreChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onFranchiseChange: (value: string) => void;
  onSportChange: (value: string) => void;
  onClear: () => void;
}

const genres = ['Action', 'Puzzle', 'Racing', 'Sports', 'RPG', 'Simulation', 'Strategy', 'Horror', 'Multiplayer', 'Arcade', 'Idle', 'Adventure', 'Survival', 'Sandbox', 'Platformer'];
const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];
const franchises = ['Call of Duty', 'NBA 2K', 'FIFA', 'Madden NFL', 'Halo', 'Mario', 'Zelda', 'Grand Theft Auto'];
const sports = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'Golf'];

export default function GameFilters({
  genre,
  year,
  franchise,
  sport,
  onGenreChange,
  onYearChange,
  onFranchiseChange,
  onSportChange,
  onClear,
}: GameFiltersProps) {
  const hasActiveFilters = genre || year || franchise || sport;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={genre} onValueChange={onGenreChange}>
        <SelectTrigger className="w-[150px] bg-card/50">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          {genres.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-[150px] bg-card/50">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={franchise} onValueChange={onFranchiseChange}>
        <SelectTrigger className="w-[180px] bg-card/50">
          <SelectValue placeholder="Franchise" />
        </SelectTrigger>
        <SelectContent>
          {franchises.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sport} onValueChange={onSportChange}>
        <SelectTrigger className="w-[150px] bg-card/50">
          <SelectValue placeholder="Sport" />
        </SelectTrigger>
        <SelectContent>
          {sports.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
