import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavoriteIds(new Set()); return; }
    const { data } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id);
    setFavoriteIds(new Set((data || []).map((f: any) => f.listing_id)));
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (listingId: string) => {
    if (!user) return false;
    setLoading(true);
    const isFav = favoriteIds.has(listingId);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(listingId); return next; });
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
      setFavoriteIds((prev) => new Set(prev).add(listingId));
    }
    setLoading(false);
    return !isFav;
  }, [user, favoriteIds]);

  const isFavorite = useCallback((listingId: string) => favoriteIds.has(listingId), [favoriteIds]);

  return { isFavorite, toggleFavorite, favoriteIds, loading, refetch: fetchFavorites };
}
