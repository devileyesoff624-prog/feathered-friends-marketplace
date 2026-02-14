import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, ShoppingBag, AlertTriangle, CheckCircle, XCircle, Ban, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"overview" | "listings" | "users" | "reports">("overview");
  const [stats, setStats] = useState({ users: 0, activeListings: 0, soldListings: 0, reports: 0 });
  const [listings, setListings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === "listings") fetchListings();
    if (tab === "users") fetchUsers();
    if (tab === "reports") fetchReports();
  }, [tab]);

  const fetchStats = async () => {
    const [{ count: userCount }, { count: activeCount }, { count: soldCount }, { count: reportCount }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "sold"),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "open"),
    ]);
    setStats({ users: userCount || 0, activeListings: activeCount || 0, soldListings: soldCount || 0, reports: reportCount || 0 });
  };

  const fetchListings = async () => {
    const { data } = await supabase.from("listings").select("*, profiles!listings_user_id_fkey(display_name)").order("created_at", { ascending: false });
    setListings(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from("reports")
      .select("*, listings(title), profiles!reports_reporter_id_fkey(display_name)")
      .order("created_at", { ascending: false });
    setReports(data || []);
  };

  const handleListingAction = async (id: string, status: string) => {
    await supabase.from("listings").update({ status: status as any }).eq("id", id);
    toast({ title: `Listing ${status}` });
    fetchListings();
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Delete this listing permanently?")) return;
    await supabase.from("listings").delete().eq("id", id);
    toast({ title: "Listing deleted" });
    fetchListings();
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    await supabase.from("profiles").update({ is_banned: !isBanned }).eq("user_id", userId);
    toast({ title: isBanned ? "User unbanned" : "User banned" });
    fetchUsers();
  };

  const handleReportAction = async (id: string, status: string) => {
    await supabase.from("reports").update({ status: status as any, resolved_at: new Date().toISOString() }).eq("id", id);
    toast({ title: `Report ${status}` });
    fetchReports();
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "listings", label: "Listings" },
    { key: "users", label: "Users" },
    { key: "reports", label: "Reports" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container py-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

          <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
                { label: "Active Listings", value: stats.activeListings, icon: ShoppingBag, color: "text-primary" },
                { label: "Sold", value: stats.soldListings, icon: CheckCircle, color: "text-accent" },
                { label: "Open Reports", value: stats.reports, icon: AlertTriangle, color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-5 shadow-soft">
                  <div className="flex items-center gap-3 mb-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                  <p className="text-3xl font-bold font-display text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "listings" && (
            <div className="space-y-2">
              {listings.map((l) => (
                <div key={l.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">by {l.profiles?.display_name} · {l.category} · ${l.price}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${l.status === "active" ? "bg-primary/10 text-primary" : l.status === "sold" ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"}`}>{l.status}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild><Link to={`/listing/${l.id}`}><Eye className="w-4 h-4" /></Link></Button>
                    {l.status !== "active" && <Button variant="ghost" size="icon" onClick={() => handleListingAction(l.id, "active")}><CheckCircle className="w-4 h-4 text-primary" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(l.id)}><XCircle className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{u.display_name?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{u.display_name}</p>
                    <p className="text-xs text-muted-foreground">{u.city || "No location"}</p>
                  </div>
                  {u.is_banned && <span className="text-xs text-destructive font-medium">Banned</span>}
                  <Button variant="ghost" size="sm" onClick={() => handleBanUser(u.user_id, u.is_banned)}>
                    <Ban className="w-4 h-4 mr-1" /> {u.is_banned ? "Unban" : "Ban"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {tab === "reports" && (
            <div className="space-y-2">
              {reports.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground">No reports</p>
              ) : (
                reports.map((r) => (
                  <div key={r.id} className="p-4 bg-card rounded-xl border border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">Report on: {r.listings?.title || "Deleted listing"}</p>
                        <p className="text-sm text-muted-foreground">by {r.profiles?.display_name} — {r.reason}</p>
                        <span className={`text-xs font-medium capitalize ${r.status === "open" ? "text-accent" : "text-muted-foreground"}`}>{r.status}</span>
                      </div>
                      {r.status === "open" && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleReportAction(r.id, "resolved")}>
                            <CheckCircle className="w-4 h-4 mr-1 text-primary" /> Resolve
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReportAction(r.id, "dismissed")}>
                            <XCircle className="w-4 h-4 mr-1" /> Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
