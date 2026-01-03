import { Bird } from "lucide-react";

const categories = [
  { name: "Parrots", count: 1240, icon: "🦜" },
  { name: "Finches", count: 856, icon: "🐦" },
  { name: "Canaries", count: 423, icon: "🐤" },
  { name: "Cockatiels", count: 678, icon: "🦅" },
  { name: "Lovebirds", count: 534, icon: "💕" },
  { name: "Macaws", count: 312, icon: "🌈" },
  { name: "Budgies", count: 945, icon: "🌿" },
  { name: "Pigeons", count: 289, icon: "🕊️" },
];

const CategoryGrid = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect bird species that matches your lifestyle and preferences.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group p-6 bg-gradient-card rounded-2xl border border-border/50 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 text-left"
            >
              <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">
                {category.icon}
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category.count.toLocaleString()} listings
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
