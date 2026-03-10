import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const SearchAutocomplete = ({ value, onChange, onSubmit }: SearchAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = debounced.trim().slice(0, 100);
      if (trimmed.length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      const sanitized = trimmed.replace(/[%_\\]/g, "\\$&");
      const { data } = await supabase
        .from("listings")
        .select("id, title, species, city, price, listing_photos(url)")
        .eq("status", "active")
        .or(`title.ilike.%${sanitized}%,species.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
        .limit(6);

      setSuggestions(data || []);
      setOpen((data || []).length > 0);
    };
    fetchSuggestions();
  }, [debounced]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setOpen(false);
      onSubmit();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search by name, species, description..."
        className="pl-10"
      />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-medium z-50 overflow-hidden">
          {suggestions.map((item) => {
            const photo = item.listing_photos?.[0]?.url;
            return (
              <Link
                key={item.id}
                to={`/listing/${item.id}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors"
                onClick={() => setOpen(false)}
              >
                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {photo ? (
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">🐦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.species && <span className="capitalize">{item.species}</span>}
                    {item.city && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {item.city}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-primary whitespace-nowrap">Rs. {Number(item.price).toLocaleString()}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
