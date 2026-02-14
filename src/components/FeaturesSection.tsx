import { Shield, MessageCircle, Camera, Search } from "lucide-react";

const features = [
  { icon: Shield, title: "Safe & Verified", desc: "Every seller is verified for safe transactions." },
  { icon: MessageCircle, title: "In-App Chat", desc: "Message sellers directly within the platform." },
  { icon: Camera, title: "Photo Listings", desc: "Upload multiple photos for each bird listing." },
  { icon: Search, title: "Smart Search", desc: "Find birds by species, location, and price range." },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Why BirdMarket?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="p-5 bg-card rounded-xl border border-border shadow-soft group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
