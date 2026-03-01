import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, Phone, Flag, ArrowLeft, Calendar, Heart, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeError } from "@/lib/sanitize-error";

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [seller, setSeller] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("id", id)
        .single();

      if (data) {
        setListing(data);
        setPhotos(data.listing_photos || []);
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, city, bio, phone")
          .eq("user_id", data.user_id)
          .single();
        setSeller(profile);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  const handleContact = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!listing) return;
    navigate(`/messages?to=${listing.user_id}&listing=${listing.id}`);
  };

  const handleReport = async () => {
    if (!user) { navigate("/auth"); return; }
    const reason = prompt("Why are you reporting this listing? (max 500 characters)");
    if (!reason) return;

    const trimmedReason = reason.trim();
    if (trimmedReason.length === 0) {
      toast({ title: "Error", description: "Please provide a reason for the report.", variant: "destructive" });
      return;
    }
    if (trimmedReason.length > 500) {
      toast({ title: "Error", description: "Report reason must be 500 characters or less.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      listing_id: listing.id,
      reason: trimmedReason,
    });
    if (error) {
      toast({ title: "Error", description: sanitizeError(error), variant: "destructive" });
    } else {
      toast({ title: "Report submitted", description: "We'll review this listing." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-20">
          <p className="text-muted-foreground text-lg">Listing not found.</p>
          <Link to="/browse" className="text-primary hover:underline mt-2 inline-block">Back to Browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container py-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photos */}
            <div className="lg:col-span-2">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
                {photos.length > 0 ? (
                  <img src={photos[selectedPhoto]?.url} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Photos</div>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos.map((p: any, i: number) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhoto(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === selectedPhoto ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="mt-6 space-y-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{listing.title}</h1>
                  <p className="text-2xl font-bold text-primary mt-1">${listing.price}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {listing.category && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium capitalize">{listing.category}</span>
                  )}
                  {listing.species && (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">{listing.species}</span>
                  )}
                  {listing.age && (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {listing.age}
                    </span>
                  )}
                  {listing.city && (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {listing.city}
                    </span>
                  )}
                </div>

                {listing.description && (
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
                  </div>
                )}

                {listing.health_info && (
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" /> Health & Vaccination
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{listing.health_info}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Seller sidebar */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5 shadow-soft">
                <h3 className="font-display font-semibold text-foreground mb-3">Seller</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {seller?.display_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{seller?.display_name || "Unknown"}</p>
                    {seller?.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {seller.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" onClick={handleContact}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Message Seller
                  </Button>
                  {user && seller?.phone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${seller.phone}`}>
                        <Phone className="w-4 h-4 mr-2" /> Call Seller
                      </a>
                    </Button>
                  )}
                  {user && seller?.phone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`https://wa.me/${seller.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <button onClick={handleReport} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
                <Flag className="w-4 h-4" /> Report this listing
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetail;
