import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display text-xl font-bold text-foreground tracking-tight">
          ScalpSense
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#why-it-matters" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Why Scalp Health</a>
          <a href="#testimonials" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          <a href="#faq" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Log In</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/quiz">Start Scalp Scan</Link>
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <a href="#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#why-it-matters" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Why Scalp Health</a>
          <a href="#testimonials" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Testimonials</a>
          <a href="#faq" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
          <Button variant="hero" size="sm" className="w-full" asChild>
            <Link to="/quiz">Start Scalp Scan</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
