import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display text-xl font-bold text-foreground tracking-tight">
          ScalpSense
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#how-it-works" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="/#why-it-matters" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Why Scalp Health</a>
          <a href="/#testimonials" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          <a href="/#faq" className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.user_metadata?.display_name || user.email?.split("@")[0] || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/quiz">Start Free Scalp Test</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <a href="/#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
          <a href="/#why-it-matters" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Why Scalp Health</a>
          <a href="/#testimonials" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Testimonials</a>
          <a href="/#faq" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>FAQ</a>
          {user ? (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" onClick={() => setOpen(false)}>Profile</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => { signOut(); setOpen(false); }}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" onClick={() => setOpen(false)}>Log In</Link>
              </Button>
              <Button variant="hero" size="sm" className="flex-1" asChild>
                <Link to="/quiz" onClick={() => setOpen(false)}>Start Free Scalp Test</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
