import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import RecentlyPlayedPage from './pages/RecentlyPlayedPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboard from './pages/AdminDashboard';
import FranchisePage from './pages/FranchisePage';
import Layout from './components/Layout';

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const gameDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game/$gameId',
  component: GameDetailPage,
});

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: FavoritesPage,
});

const recentlyPlayedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recently-played',
  component: RecentlyPlayedPage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: LeaderboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const franchiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchise/$name',
  component: FranchisePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  gameDetailRoute,
  favoritesRoute,
  recentlyPlayedRoute,
  leaderboardRoute,
  adminRoute,
  franchiseRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
