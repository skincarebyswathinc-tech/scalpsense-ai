import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/" className="font-display text-lg font-bold text-foreground">
        ScalpSense
      </Link>
      <div className="flex gap-6 text-sm font-body text-muted-foreground">
        <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        <Link to="/quiz" className="hover:text-foreground transition-colors">Take the Quiz</Link>
      </div>
      <p className="text-xs text-muted-foreground font-body">
        © {new Date().getFullYear()} ScalpSense. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
