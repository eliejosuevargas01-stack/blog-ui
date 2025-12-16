import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary to-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-bold">
              S
            </div>
            <span className="hidden sm:inline text-foreground">
              seommerce
              <span className="text-secondary">.shop</span>
            </span>
            <span className="sm:hidden text-foreground">seommerce</span>
          </Link>

          <div className="flex items-center gap-8">
            <nav className="hidden sm:flex items-center gap-8">
              <Link
                to="/"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <a
                href="#technology"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                Technology
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </a>
              <a
                href="#business"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                Business
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </a>
              <a
                href="#marketing"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                Marketing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
              </a>
            </nav>

            <button className="sm:flex hidden px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:shadow-lg transition-all hover:shadow-secondary/20 hover:scale-105">
              Subscribe
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
