import { Menu, X, MessageCircle, User, LogOut, Shield, Plus, Heart } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/use-favorites";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Bird Bazaar" className="w-8 h-8" />
          <span className="font-display text-lg font-bold text-foreground">
            Bird <span className="text-[sidebar-accent-foreground] text-black">Bazaar</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
          {user &&
          <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">My Listings</Link>
              <Link to="/messages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Messages</Link>
            </>
          }
          {isAdmin &&
          <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          }
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ?
          <>
              <Button variant="default" size="sm" asChild>
                <Link to="/create-listing"><Plus className="w-4 h-4 mr-1" /> Sell</Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/favorites"><Heart className="w-5 h-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/messages"><MessageCircle className="w-5 h-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile"><User className="w-5 h-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </> :

          <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          }
        </div>

        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isMenuOpen &&
      <div className="md:hidden border-t border-border bg-background animate-fade-up">
          <div className="container py-4 flex flex-col gap-3">
            <Link to="/browse" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>Browse</Link>
            {user &&
          <>
                <Link to="/dashboard" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>My Listings</Link>
                <Link to="/favorites" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>Favorites</Link>
                <Link to="/messages" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>Messages</Link>
                <Link to="/profile" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <Link to="/create-listing" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>Sell a Bird</Link>
                {isAdmin && <Link to="/admin" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>Admin</Link>}
                <button onClick={handleSignOut} className="text-sm font-medium py-2 text-left text-destructive">Sign Out</button>
              </>
          }
            {!user &&
          <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
          }
          </div>
        </div>
      }
    </nav>);

};

export default Navbar;