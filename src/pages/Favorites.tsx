import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/use-favorites";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";

const Favorites = () => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, favoriteIds } = useFavorites();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!user || favoriteIds.size === 0) {
        setListings([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .in("id", Array.from(favoriteIds));
      setListings(data || []);
      setLoading(false);
    };
    fetchFavoriteListings();
  }, [user, favoriteIds]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-destructive" />
            <h1 className="font-display text-2xl font-bold text-foreground">My Favorites</h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                  <div className="aspect-square bg-muted rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">You haven't saved any birds yet.</p>
              <Link to="/browse" className="text-primary hover:underline text-sm font-medium">
                Browse Birds →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((listing) => {
                const photo = listing.listing_photos?.[0]?.url;
                return (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group bg-card rounded-xl border border-border overflow-hidden shadow-soft hover:shadow-medium transition-all hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {photo ? (
                        <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Photo</div>
                      )}
                      <div className="absolute top-2 right-2">
                        <FavoriteButton listingId={listing.id} isFavorite={isFavorite(listing.id)} onToggle={toggleFavorite} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{listing.species || listing.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-display text-lg font-bold text-primary">Rs. {Number(listing.price).toLocaleString()}</p>
                        {listing.city && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" /> {listing.city}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
