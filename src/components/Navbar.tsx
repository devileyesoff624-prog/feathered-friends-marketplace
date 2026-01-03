import { Bird, Menu, X, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-gradient-hero shadow-glow group-hover:scale-105 transition-transform">
            <Bird className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Feather<span className="text-primary">Exchange</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse Birds
          </a>
          <a href="#" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </a>
          <a href="#" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Breeders
          </a>
          <a href="#" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Resources
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="warm">
            List Your Bird
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border animate-fade-up">
          <div className="container py-4 flex flex-col gap-4">
            <a href="#" className="font-body text-sm font-medium text-foreground py-2">
              Browse Birds
            </a>
            <a href="#" className="font-body text-sm font-medium text-foreground py-2">
              Categories
            </a>
            <a href="#" className="font-body text-sm font-medium text-foreground py-2">
              Breeders
            </a>
            <a href="#" className="font-body text-sm font-medium text-foreground py-2">
              Resources
            </a>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1">Sign In</Button>
              <Button variant="warm" className="flex-1">List Your Bird</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
