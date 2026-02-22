import { useGetLeaderboard, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const { data: leaderboard = [], isLoading } = useGetLeaderboard();
  const { identity } = useInternetIdentity();

  const currentUserPrincipal = identity?.getPrincipal().toString();

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h1 className="text-4xl font-bold">Leaderboard</h1>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Total Plays</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map(([principal, plays], index) => (
              <LeaderboardRow
                key={principal.toString()}
                rank={index + 1}
                principal={principal}
                plays={Number(plays)}
                isCurrentUser={principal.toString() === currentUserPrincipal}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No players yet</h2>
          <p className="text-muted-foreground">
            Be the first to play games and climb the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
}

interface LeaderboardRowProps {
  rank: number;
  principal: any;
  plays: number;
  isCurrentUser: boolean;
}

function LeaderboardRow({ rank, principal, plays, isCurrentUser }: LeaderboardRowProps) {
  const { data: userProfile } = useGetUserProfile(principal);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <TableRow className={isCurrentUser ? 'bg-cyan-500/10' : ''}>
      <TableCell className="font-bold text-lg">{getRankIcon(rank)}</TableCell>
      <TableCell className="font-medium">
        {userProfile?.name || 'Anonymous'}
        {isCurrentUser && (
          <span className="ml-2 text-xs text-cyan-500 font-semibold">(You)</span>
        )}
      </TableCell>
      <TableCell className="text-right font-semibold">{plays.toLocaleString()}</TableCell>
    </TableRow>
  );
}
