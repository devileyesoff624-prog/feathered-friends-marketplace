import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Calendar } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import FavoriteButton from "@/components/FavoriteButton";
import { format } from "date-fns";

const SellerProfile = () => {
  const { userId } = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetch = async () => {
      if (!userId) return;

      const { data: profile } = await supabase
        .from("profiles_public" as any)
        .select("*")
        .eq("user_id", userId)
        .single();

      setSeller(profile);

      const { data: sellerListings } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      setListings(sellerListings || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-20">
          <p className="text-muted-foreground text-lg">Seller not found.</p>
          <Link to="/browse" className="text-primary hover:underline mt-2 inline-block">Back to Browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container py-8 max-w-5xl">
          {/* Seller Info */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-soft mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                {seller.avatar_url ? (
                  <img src={seller.avatar_url} className="w-full h-full rounded-full object-cover" alt={seller.display_name} />
                ) : (
                  seller.display_name?.[0]?.toUpperCase() || "?"
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{seller.display_name || "Unknown Seller"}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {seller.city && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {seller.city}</span>
                  )}
                  {seller.created_at && (
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {format(new Date(seller.created_at), "MMM yyyy")}</span>
                  )}
                </div>
                {seller.bio && <p className="text-muted-foreground mt-2 text-sm">{seller.bio}</p>}
              </div>
            </div>
          </div>

          {/* Listings */}
          <h2 className="font-display text-xl font-bold text-foreground mb-4">
            Active Listings ({listings.length})
          </h2>

          {listings.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No active listings.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

export default SellerProfile;
