import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface ReviewListProps {
  sellerId: string;
  refreshKey?: number;
}

const ReviewList = ({ sellerId, refreshKey }: ReviewListProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("reviews" as any)
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        // Fetch reviewer names
        const reviewerIds = [...new Set((data as any[]).map((r: any) => r.reviewer_id))];
        const { data: profiles } = await supabase
          .from("profiles_public" as any)
          .select("user_id, display_name, avatar_url")
          .in("user_id", reviewerIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        setReviews((data as any[]).map((r: any) => ({ ...r, reviewer: profileMap.get(r.reviewer_id) })));
      } else {
        setReviews([]);
      }
      setLoading(false);
    };
    fetchReviews();
  }, [sellerId, refreshKey]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>;
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${star <= Math.round(avgRating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {review.reviewer?.display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-sm font-medium text-foreground">{review.reviewer?.display_name || "Anonymous"}</span>
              </div>
              <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "MMM d, yyyy")}</span>
            </div>
            <div className="flex gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
