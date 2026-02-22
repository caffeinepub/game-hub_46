import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetGameComments,
  useAddComment,
  useUpdateComment,
  useDeleteComment,
  useGetUserProfile,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
  gameId: string;
}

export default function CommentsSection({ gameId }: CommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: comments = [] } = useGetGameComments(gameId);
  const addComment = useAddComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editContent, setEditContent] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync({ gameId, content: newComment.trim() });
      setNewComment('');
      toast.success('Comment posted');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleEdit = async (commentId: bigint) => {
    if (!editContent.trim()) return;

    try {
      await updateComment.mutateAsync({ commentId, content: editContent.trim() });
      setEditingId(null);
      setEditContent('');
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (commentId: bigint) => {
    try {
      await deleteComment.mutateAsync(commentId);
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const sortedComments = [...comments].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Comments</h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="min-h-[100px]"
          />
          <Button
            type="submit"
            disabled={addComment.isPending || !newComment.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {addComment.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <CommentCard
            key={comment.id.toString()}
            comment={comment}
            isOwner={identity?.getPrincipal().toString() === comment.author.toString()}
            isEditing={editingId === comment.id}
            editContent={editContent}
            onEditStart={() => {
              setEditingId(comment.id);
              setEditContent(comment.content);
            }}
            onEditCancel={() => {
              setEditingId(null);
              setEditContent('');
            }}
            onEditSave={() => handleEdit(comment.id)}
            onEditChange={setEditContent}
            onDelete={() => handleDelete(comment.id)}
          />
        ))}
        {sortedComments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: any;
  isOwner: boolean;
  isEditing: boolean;
  editContent: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onEditChange: (value: string) => void;
  onDelete: () => void;
}

function CommentCard({
  comment,
  isOwner,
  isEditing,
  editContent,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditChange,
  onDelete,
}: CommentCardProps) {
  const { data: userProfile } = useGetUserProfile(comment.author);

  const timestamp = new Date(Number(comment.timestamp) / 1000000);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium">{userProfile?.name || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        {isOwner && !isEditing && (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEditStart}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea value={editContent} onChange={(e) => onEditChange(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={onEditSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onEditCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm">{comment.content}</p>
      )}
    </Card>
  );
}
