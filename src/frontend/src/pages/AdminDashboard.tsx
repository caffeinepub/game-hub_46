import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useIsCallerAdmin,
  useListGames,
  useCreateGame,
  useUpdateGame,
  useDeleteGame,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Game, GameInput } from '../backend';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: games = [], isLoading: gamesLoading } = useListGames();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const deleteGame = useDeleteGame();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<GameInput>({
    title: '',
    franchise: '',
    releaseYear: BigInt(2026),
    developer: '',
    genre: '',
    platform: '',
    sport: '',
    description: '',
    tags: [],
    trending: false,
    isNew: false,
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate({ to: '/' });
    }
  }, [isAdmin, adminLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingGame) {
        await updateGame.mutateAsync({ gameId: editingGame.id, input: formData });
        toast.success('Game updated successfully');
      } else {
        await createGame.mutateAsync(formData);
        toast.success('Game created successfully');
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save game');
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      franchise: game.franchise,
      releaseYear: game.releaseYear,
      developer: game.developer,
      genre: game.genre,
      platform: game.platform,
      sport: game.sport,
      description: game.description,
      tags: game.tags,
      trending: game.trending,
      isNew: game.isNew,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      await deleteGame.mutateAsync(gameId);
      toast.success('Game deleted successfully');
    } catch (error) {
      toast.error('Failed to delete game');
    }
  };

  const resetForm = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      franchise: '',
      releaseYear: BigInt(2026),
      developer: '',
      genre: '',
      platform: '',
      sport: '',
      description: '',
      tags: [],
      trending: false,
      isNew: false,
    });
  };

  if (adminLoading || gamesLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-cyan-500" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Developer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{game.genre}</TableCell>
                <TableCell>{game.releaseYear.toString()}</TableCell>
                <TableCell>{game.developer}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(game)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(game.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingGame ? 'update' : 'create'} a game.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="franchise">Franchise</Label>
                <Input
                  id="franchise"
                  value={formData.franchise}
                  onChange={(e) => setFormData({ ...formData, franchise: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseYear">Release Year *</Label>
                <Input
                  id="releaseYear"
                  type="number"
                  value={formData.releaseYear.toString()}
                  onChange={(e) =>
                    setFormData({ ...formData, releaseYear: BigInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="developer">Developer *</Label>
                <Input
                  id="developer"
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Input
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sport">Sport (optional)</Label>
                <Input
                  id="sport"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map((t) => t.trim()),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="trending"
                  checked={formData.trending}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, trending: checked })
                  }
                />
                <Label htmlFor="trending">Trending</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isNew"
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                />
                <Label htmlFor="isNew">New Release</Label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGame.isPending || updateGame.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {createGame.isPending || updateGame.isPending
                  ? 'Saving...'
                  : editingGame
                  ? 'Update Game'
                  : 'Create Game'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
