import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeError } from "@/lib/sanitize-error";
import { useNavigate } from "react-router-dom";

interface ReviewFormProps {
  sellerId: string;
  listingId: string;
  onSubmitted: () => void;
}

const ReviewForm = ({ sellerId, listingId, onSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-2">Log in to leave a review</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  if (user.id === sellerId) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    const trimmed = comment.trim();
    if (trimmed.length > 500) {
      toast({ title: "Comment too long", description: "Max 500 characters.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews" as any).insert({
      reviewer_id: user.id,
      seller_id: sellerId,
      listing_id: listingId,
      rating,
      comment: trimmed || null,
    });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already reviewed", description: "You've already reviewed this listing.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: sanitizeError(error), variant: "destructive" });
      }
    } else {
      toast({ title: "Review submitted!" });
      setRating(0);
      setComment("");
      onSubmitted();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <h4 className="font-display font-semibold text-foreground text-sm">Leave a Review</h4>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-colors"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hover || rating)
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Share your experience (optional, max 500 chars)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
      />
      <Button onClick={handleSubmit} disabled={submitting || rating === 0} size="sm">
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
};

export default ReviewForm;
