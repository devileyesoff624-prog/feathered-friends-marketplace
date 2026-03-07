import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeError } from "@/lib/sanitize-error";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("listings")
      .select("*, listing_photos(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: sanitizeError(error), variant: "destructive" });
    } else {
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Listing deleted" });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status: status as any }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: sanitizeError(error), variant: "destructive" });
    } else {
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  };

  const statusColors: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    sold: "bg-muted text-muted-foreground",
    pending: "bg-accent/10 text-accent",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">My Listings</h1>
            <Button asChild>
              <Link to="/create-listing"><Plus className="w-4 h-4 mr-2" /> New Listing</Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-card rounded-xl border border-border animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">You haven't listed any birds yet.</p>
              <Button asChild>
                <Link to="/create-listing"><Plus className="w-4 h-4 mr-2" /> Create Your First Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => {
                const photo = listing.listing_photos?.[0]?.url;
                return (
                  <div key={listing.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-soft">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {photo ? (
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{listing.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-primary">PKR {listing.price}</span>
                        {listing.city && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {listing.city}
                          </span>
                        )}
                      </div>
                    </div>
                    <select
                      value={listing.status}
                      onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${statusColors[listing.status] || ""}`}
                    >
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="pending">Pending</option>
                    </select>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/listing/${listing.id}`}><Eye className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
