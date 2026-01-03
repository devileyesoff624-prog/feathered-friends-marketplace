import { Bird, Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-hero shadow-glow">
                <Bird className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Feather<span className="text-secondary">Exchange</span>
              </span>
            </a>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              The trusted marketplace for bird lovers. Connect with breeders and find your perfect feathered companion.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Browse Birds</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Categories</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Breeders</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Sell Your Bird</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Care Guides</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Bird Health</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Training Tips</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Community Forum</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Stay Updated</h4>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Subscribe for the latest listings and bird care tips.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <button className="px-4 h-10 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2025 FeatherExchange. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">Privacy Policy</a>
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">Terms of Service</a>
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground/70 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
