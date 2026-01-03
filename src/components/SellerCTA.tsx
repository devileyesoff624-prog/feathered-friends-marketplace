import { Button } from "@/components/ui/button";
import { Camera, DollarSign, Sparkles } from "lucide-react";

const SellerCTA = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground/90">Start Selling Today</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Have Birds to Sell?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join our community of trusted breeders and bird enthusiasts. List your birds for free and reach thousands of potential buyers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="secondary" size="xl">
              <Camera className="w-5 h-5 mr-2" />
              List Your Bird
            </Button>
            <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              Learn More
            </Button>
          </div>

          {/* Selling Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <DollarSign className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-primary-foreground mb-1">Free Listings</h3>
              <p className="text-sm text-primary-foreground/70">No fees to list your birds</p>
            </div>
            <div className="p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Camera className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-primary-foreground mb-1">Easy Upload</h3>
              <p className="text-sm text-primary-foreground/70">Add photos in minutes</p>
            </div>
            <div className="p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Sparkles className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-primary-foreground mb-1">Wide Reach</h3>
              <p className="text-sm text-primary-foreground/70">Connect with buyers nationally</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCTA;
