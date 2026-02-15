import { Button } from "@/components/ui/button";
import { Plus, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const SellerCTA = () => {
  return (
    <section className="py-16 bg-gradient-hero relative overflow-hidden">
      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Have Birds to Sell?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            List your birds for free and reach thousands of potential buyers. It's fast, easy, and secure.
          </p>

          <Button size="lg" variant="secondary" asChild>
            <Link to="/create-listing"><Plus className="w-4 h-4 mr-2" /> List Your Bird — Free</Link>
          </Button>

          <div className="grid grid-cols-2 gap-4 mt-10 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm">Quick upload</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-center font-thin text-sm">Direct conversation with  buyers</span>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default SellerCTA;