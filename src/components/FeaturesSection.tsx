import { Shield, Users, MessageCircle, Award } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Sellers",
    description: "Every seller is verified to ensure safe and legitimate transactions for all birds."
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join thousands of bird enthusiasts sharing knowledge and experiences."
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Connect directly with sellers to ask questions and arrange viewings."
  },
  {
    icon: Award,
    title: "Health Guarantee",
    description: "All listed birds come with health documentation and breeder certifications."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A trusted platform built by bird lovers, for bird lovers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="p-6 bg-card rounded-2xl border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
