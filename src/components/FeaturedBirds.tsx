import BirdCard from "./BirdCard";
import birdMacaw from "@/assets/bird-macaw.jpg";
import birdCockatiel from "@/assets/bird-cockatiel.jpg";
import birdBudgie from "@/assets/bird-budgie.jpg";
import birdAfricanGrey from "@/assets/bird-african-grey.jpg";
import birdCanary from "@/assets/bird-canary.jpg";
import birdConure from "@/assets/bird-conure.jpg";

const featuredBirds = [
  {
    id: 1,
    name: "Azure the Macaw",
    species: "Blue & Gold Macaw",
    price: 2500,
    location: "Miami, FL",
    image: birdMacaw,
    rating: 4.9,
    reviews: 23,
    age: "2 years",
    seller: "TropicalBirds"
  },
  {
    id: 2,
    name: "Sunny",
    species: "Cockatiel",
    price: 150,
    location: "Austin, TX",
    image: birdCockatiel,
    rating: 5.0,
    reviews: 45,
    age: "8 months",
    seller: "BirdLover22"
  },
  {
    id: 3,
    name: "Kiwi",
    species: "Green Budgie",
    price: 45,
    location: "Denver, CO",
    image: birdBudgie,
    rating: 4.8,
    reviews: 67,
    age: "6 months",
    seller: "FeatherFarm"
  },
  {
    id: 4,
    name: "Einstein",
    species: "African Grey Parrot",
    price: 3200,
    location: "Seattle, WA",
    image: birdAfricanGrey,
    rating: 4.9,
    reviews: 12,
    age: "3 years",
    seller: "ExoticAviary"
  },
  {
    id: 5,
    name: "Tweety",
    species: "Yellow Canary",
    price: 75,
    location: "Phoenix, AZ",
    image: birdCanary,
    rating: 4.7,
    reviews: 89,
    age: "1 year",
    seller: "SongbirdHaven"
  },
  {
    id: 6,
    name: "Mango",
    species: "Sun Conure",
    price: 650,
    location: "Orlando, FL",
    image: birdConure,
    rating: 5.0,
    reviews: 34,
    age: "10 months",
    seller: "ColorfulWings"
  }
];

const FeaturedBirds = () => {
  return (
    <section className="py-20 bg-gradient-sky">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Birds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular listings from trusted sellers and breeders across the country.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBirds.map((bird) => (
            <BirdCard key={bird.id} {...bird} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="font-body text-primary font-medium hover:underline underline-offset-4 transition-all">
            View All Listings →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBirds;
