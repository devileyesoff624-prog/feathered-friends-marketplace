
-- 1. Fix profiles UPDATE policy to prevent users from changing is_banned
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (
  (auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  CASE
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN true
    ELSE (
      auth.uid() = user_id AND
      is_banned IS NOT DISTINCT FROM (SELECT p.is_banned FROM profiles p WHERE p.user_id = profiles.user_id)
    )
  END
);

-- 2. Fix storage policy for listing-photos uploads (restrict to listing owners)
DROP POLICY IF EXISTS "Authenticated users can upload listing photos" ON storage.objects;

CREATE POLICY "Users can upload photos for own listings" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'listing-photos' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.listings
    WHERE id::text = (storage.foldername(name))[1]
    AND user_id = auth.uid()
  )
);

-- 3. Fix storage delete policy for listing photos (restrict to listing owners)
DROP POLICY IF EXISTS "Users can delete own listing photos" ON storage.objects;

CREATE POLICY "Users can delete own listing photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'listing-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 4. Add constraint on report reason length
ALTER TABLE public.reports ADD CONSTRAINT reason_length CHECK (length(reason) <= 500);
