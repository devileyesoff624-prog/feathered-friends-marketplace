import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/hooks/use-favorites";
import FavoriteButton from "@/components/FavoriteButton";
import { pakistanCities } from "@/lib/pakistan-cities";
import SearchAutocomplete from "@/components/SearchAutocomplete";

const categories = [
  { value: "", label: "All Categories" },
  { value: "parrots", label: "Parrots" },
  { value: "pigeons", label: "Pigeons" },
  { value: "hens", label: "Hens" },
  { value: "exotic", label: "Exotic Birds" },
  { value: "others", label: "Others" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const PAGE_SIZE = 12;

const Browse = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*, listing_photos(*)", { count: "exact" })
      .eq("status", "active");

    if (search) {
      const sanitized = search.trim().slice(0, 100).replace(/[%_\\]/g, '\\$&');
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,species.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }
    }
    if (category) query = query.eq("category", category as any);
    if (city) query = query.ilike("city", `%${city}%`);
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count } = await query;
    setListings(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [category, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="bg-gradient-sky border-b border-border">
          <div className="container py-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">Browse Birds</h1>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <SearchAutocomplete
                value={search}
                onChange={setSearch}
                onSubmit={() => { setPage(0); fetchListings(); }}
              />
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(0); }}
                  className="h-10 pl-10 pr-3 rounded-md border border-input bg-background text-sm w-full sm:w-44 appearance-none"
                >
                  <option value="">All Cities</option>
                  {pakistanCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Button type="submit">Search</Button>
              <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="w-4 h-4 mr-1" /> Filters
              </Button>
            </form>

            {showFilters && (
              <div className="mt-4 p-4 bg-card rounded-xl border border-border flex flex-wrap gap-4 items-end animate-fade-up">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
                    {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Price</label>
                  <Input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" placeholder="0" className="w-24 h-9" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Price</label>
                  <Input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" placeholder="Any" className="w-24 h-9" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort</label>
                  <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} className="h-9 px-3 rounded-lg border border-input bg-background text-sm">
                    {sortOptions.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                  </select>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setCategory(""); setMinPrice(""); setMaxPrice(""); setSort("newest"); setCity(""); setSearch(""); setPage(0); }}>
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="container py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
                  <div className="aspect-square bg-muted rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-5 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-2">No listings found.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
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
                          <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
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
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {listing.city || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
