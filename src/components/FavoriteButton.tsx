import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  isFavorite: boolean;
  onToggle: (listingId: string) => Promise<boolean | undefined>;
  size?: "sm" | "md";
  className?: string;
}

const FavoriteButton = ({ listingId, isFavorite, onToggle, size = "sm", className }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/auth"); return; }
    await onToggle(listingId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "rounded-full transition-all hover:scale-110",
        size === "sm" ? "p-1.5" : "p-2",
        isFavorite
          ? "bg-destructive/10 text-destructive"
          : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive",
        className
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn(size === "sm" ? "w-4 h-4" : "w-5 h-5", isFavorite && "fill-current")} />
    </button>
  );
};

export default FavoriteButton;
