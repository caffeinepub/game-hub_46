import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Game, GameInput, UserProfileView } from '../backend';

// Games
export function useListGames() {
  const { actor, isFetching } = useActor();

  return useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGames();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300000, // 5 minutes
  });
}

export function useGetGame(gameId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Game>({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGame(gameId);
    },
    enabled: !!actor && !isFetching && !!gameId,
  });
}

export function useCreateGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GameInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGame(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useUpdateGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, input }: { gameId: string; input: GameInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGame(gameId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

export function useDeleteGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGame(gameId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfileView | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: any) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfileView | null>({
    queryKey: ['userProfile', principal.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfileView) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Favorites
export function useUpdateFavorites() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, add }: { gameId: string; add: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFavorites(gameId, add);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Play Game
export function usePlayGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.playGame(gameId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Rating
export function useRateGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, stars }: { gameId: string; stars: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rateGame(gameId, stars);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
}

// Comments
export function useGetGameComments(gameId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['comments', gameId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGameComments(gameId);
    },
    enabled: !!actor && !isFetching && !!gameId,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, content }: { gameId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(gameId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.gameId] });
    },
  });
}

export function useUpdateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateComment(commentId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

// Leaderboard
export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLeaderboard(BigInt(100));
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000, // 1 minute
  });
}

// Admin
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
