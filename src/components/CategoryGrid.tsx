import { Link } from "react-router-dom";

const categories = [
  { name: "Parrots", value: "parrots", icon: "🦜", desc: "Macaws, Cockatoos & more" },
  { name: "Pigeons", value: "pigeons", icon: "🕊️", desc: "Racing & Fancy breeds" },
  { name: "Hens", value: "hens", icon: "🐔", desc: "Layers & exotic breeds" },
  { name: "Exotic Birds", value: "exotic", icon: "🌈", desc: "Rare & unique species" },
  { name: "Others", value: "others", icon: "🐦", desc: "Finches, canaries & more" },
];

const CategoryGrid = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Browse by Category</h2>
          <p className="text-muted-foreground">Find the perfect bird species for you.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/browse?category=${cat.value}`}
              className="group p-5 bg-card rounded-xl border border-border shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all text-center"
            >
              <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-display font-semibold text-foreground text-sm">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
