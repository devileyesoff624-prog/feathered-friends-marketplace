import { Bird, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="text-primary-foreground py-12 bg-popover-foreground">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="">
                <Bird className="" />
              </div>
              <span className="font-display text-lg font-bold">
                Bird <span className="text-current">Bazaar</span>
              </span>
            </Link>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              The trusted marketplace for bird lovers. Buy, sell, and connect.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Browse Birds</Link></li>
              <li><Link to="/create-listing" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Sell a Bird</Link></li>
              <li><Link to="/auth" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          







        </div>

        <div className="pt-6 border-t border-primary-foreground/10 text-center">
          <p className="text-primary-foreground/40 text-sm">© 2026 BirdMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>);

};

export default Footer;