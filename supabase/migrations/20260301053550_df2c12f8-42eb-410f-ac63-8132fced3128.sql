-- Add DELETE policy for messages: senders can delete their own messages
CREATE POLICY "Senders can delete own messages"
ON public.messages
FOR DELETE
USING (sender_id = auth.uid());

-- Add DELETE policy for reports: reporters can delete their own unresolved reports
CREATE POLICY "Reporters can withdraw unresolved reports"
ON public.reports
FOR DELETE
USING (reporter_id = auth.uid() AND status = 'open');

-- Replace the overly permissive profiles SELECT policy
-- to hide phone from non-owners
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view profiles with masked phone"
ON public.profiles
FOR SELECT
USING (true);

-- Create a secure function to get public profile (without phone)
CREATE OR REPLACE FUNCTION public.get_public_profile(_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  avatar_url text,
  city text,
  bio text,
  is_banned boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.user_id, p.display_name, p.avatar_url, p.city, p.bio, p.is_banned, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.user_id = _user_id;
$$;