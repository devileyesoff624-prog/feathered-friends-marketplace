-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view profiles with masked phone" ON public.profiles;

-- Create restrictive SELECT policy on base table:
-- Only profile owner and admins can read from profiles directly
CREATE POLICY "Owner and admin can read profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create a public view that excludes phone
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, user_id, display_name, avatar_url, city, bio, is_banned, created_at, updated_at
FROM public.profiles;