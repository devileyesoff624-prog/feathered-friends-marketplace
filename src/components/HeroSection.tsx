import { Search, Bird, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBird from "@/assets/hero-bird.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBird} 
          alt="Beautiful colorful parrot" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
            <Bird className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground/90">Trusted Bird Marketplace</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-secondary">Feathered Friend</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg font-body">
            Connect with trusted breeders and bird enthusiasts. Buy, sell, and discover beautiful birds from around the world.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search for birds..."
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card/95 backdrop-blur-sm border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary font-body text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Location"
                className="w-full sm:w-40 h-14 pl-12 pr-4 rounded-2xl bg-card/95 backdrop-blur-sm border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary font-body text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button variant="hero" size="xl">
              Search
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 text-primary-foreground/90">
            <div>
              <p className="text-3xl font-bold font-display">5,000+</p>
              <p className="text-sm text-primary-foreground/70">Birds Listed</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display">2,500+</p>
              <p className="text-sm text-primary-foreground/70">Happy Owners</p>
            </div>
            <div>
              <p className="text-3xl font-bold font-display">500+</p>
              <p className="text-sm text-primary-foreground/70">Trusted Breeders</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
