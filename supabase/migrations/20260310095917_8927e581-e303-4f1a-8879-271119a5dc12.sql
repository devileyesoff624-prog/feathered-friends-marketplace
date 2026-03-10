
-- Reviews table: buyers rate sellers after a transaction
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint: one review per buyer per listing
CREATE UNIQUE INDEX unique_review_per_listing ON public.reviews (reviewer_id, listing_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews (not for own listings)
CREATE POLICY "Buyers can create reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND seller_id != auth.uid()
  );

-- Reviewers can delete own reviews
CREATE POLICY "Reviewers can delete own reviews" ON public.reviews
  FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid());
