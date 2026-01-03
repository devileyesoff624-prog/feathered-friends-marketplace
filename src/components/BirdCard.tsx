import { Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";

interface BirdCardProps {
  id: number;
  name: string;
  species: string;
  price: number;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  age: string;
  seller: string;
}

const BirdCard = ({ name, species, price, location, image, rating, reviews, age, seller }: BirdCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-border/50">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-card/90 backdrop-blur-sm shadow-soft hover:scale-110 transition-transform"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
          />
        </button>
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground">
          {age}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{species}</p>
          </div>
          <p className="font-display text-xl font-bold text-primary">${price}</p>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-secondary text-secondary" />
          <span className="text-sm font-medium text-foreground">{rating}</span>
          <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <span className="text-muted-foreground">by {seller}</span>
        </div>
      </div>
    </div>
  );
};

export default BirdCard;
