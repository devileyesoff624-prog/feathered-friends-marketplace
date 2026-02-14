import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const FeaturedBirds = () => {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);
      setListings(data || []);
    };
    fetch();
  }, []);

  if (listings.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-sky">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Latest Listings</h2>
          <p className="text-muted-foreground">Fresh birds just posted by sellers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => {
            const photo = listing.listing_photos?.[0]?.url;
            return (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-border shadow-soft hover:shadow-medium transition-all hover:-translate-y-0.5"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {photo ? (
                    <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Photo</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{listing.species || listing.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-display text-lg font-bold text-primary">${listing.price}</p>
                    {listing.city && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {listing.city}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/browse" className="text-primary font-medium hover:underline underline-offset-4 text-sm">
            View All Listings →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBirds;
