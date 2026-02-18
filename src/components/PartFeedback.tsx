import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PartFeedbackProps {
  inspectionId: string | null;
  partCode: string;
  userId: string | null;
}

export function PartFeedback({ inspectionId, partCode, userId }: PartFeedbackProps) {
  const [rating, setRating] = useState<boolean | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  if (!inspectionId || !userId) return null;

  const submitFeedback = async (isPositive: boolean, feedbackComment?: string) => {
    setSaving(true);
    try {
      const { error } = await (supabase.from as any)('inspection_feedback')
        .upsert(
          {
            inspection_id: inspectionId,
            part_code: partCode,
            rating: isPositive,
            comment: feedbackComment || null,
            user_id: userId,
          },
          { onConflict: 'inspection_id,part_code,user_id' }
        );

      if (error) throw error;

      setRating(isPositive);
      toast({
        title: 'Feedback saved. Optimizing AI model.',
        duration: 2000,
      });

      if (!isPositive && !feedbackComment) {
        setShowComment(true);
      } else {
        setShowComment(false);
      }
    } catch (err) {
      console.error('Feedback error:', err);
      toast({
        title: 'Failed to save feedback',
        variant: 'destructive',
        duration: 2000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleThumbDown = () => {
    if (rating === false) return;
    submitFeedback(false);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      submitFeedback(false, comment.trim());
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">Rate:</span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7',
          rating === true && 'bg-success/20 text-success'
        )}
        disabled={saving}
        onClick={() => {
          if (rating === true) return;
          setShowComment(false);
          submitFeedback(true);
        }}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7',
          rating === false && 'bg-destructive/20 text-destructive'
        )}
        disabled={saving}
        onClick={handleThumbDown}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>

      {showComment && (
        <form
          className="flex items-center gap-1.5 ml-1"
          onSubmit={(e) => {
            e.preventDefault();
            handleCommentSubmit();
          }}
        >
          <Input
            placeholder="Reason (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="h-7 text-xs w-72 bg-muted/50"
            autoFocus
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs px-2">
            Send
          </Button>
        </form>
      )}
    </div>
  );
}
