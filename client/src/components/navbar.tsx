import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "HOME" },
    { path: "/research", label: "RESEARCH" },
    { path: "/teaching", label: "TEACHING" },
    { path: "/students", label: "STUDENTS" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <nav className="relative z-10 pt-5 pb-2 bg-[#2c3340]">
      <div className="max-w-[68em] mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        {/* Floating pill — translucent, thin border */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded border border-white/15 bg-transparent">
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant="ghost"
                  className={`text-xs tracking-[0.25em] uppercase font-normal px-4 hover:bg-transparent ${
                    isActive(link.path)
                      ? "text-white"
                      : "text-white/65 hover:text-white"
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-4 rounded border border-white/25 bg-background/80 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-xs tracking-[0.25em] uppercase font-semibold ${
                    isActive(link.path)
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
