import { Search, Bird, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBird from "@/assets/hero-bird.jpg";

const HeroSection = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(search)}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroBird} alt="Beautiful colorful parrot" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/30" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-2xl animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-5">
            <Bird className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground/90">Trusted Bird Marketplace</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-5 leading-tight">
            Buy & Sell Birds<br />
            <span className="text-accent">With Confidence</span>
          </h1>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
            Connect with trusted sellers and find your perfect feathered companion. Safe, easy, and community-driven.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for birds..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" size="lg" className="h-12">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-6 text-primary-foreground/90">
            <div>
              <p className="text-2xl font-bold font-display">5,000+</p>
              <p className="text-xs text-primary-foreground/60">Birds Listed</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display">2,500+</p>
              <p className="text-xs text-primary-foreground/60">Happy Owners</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display">500+</p>
              <p className="text-xs text-primary-foreground/60">Trusted Sellers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
