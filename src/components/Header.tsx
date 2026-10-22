import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  celebrantName: string;
}

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: "La célébration", href: "#celebration", id: "celebration" },
  { label: "Programme", href: "#programme", id: "programme" },
  { label: "Infos pratiques", href: "#infos", id: "infos" },
  { label: "Galerie", href: "#galerie", id: "galerie" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

const MOBILE_ALL_NAV: NavItem[] = [
  { label: "Accueil", href: "#accueil", id: "accueil" },
  { label: "La célébration", href: "#celebration", id: "celebration" },
  { label: "Programme", href: "#programme", id: "programme" },
  { label: "Infos pratiques", href: "#infos", id: "infos" },
  { label: "Confirmation", href: "#confirmation", id: "confirmation" },
  { label: "Messages", href: "#messages", id: "messages" },
  { label: "Galerie", href: "#galerie", id: "galerie" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

export const Header: React.FC<HeaderProps> = ({ celebrantName }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("accueil");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = MOBILE_ALL_NAV.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.1, 0.3, 0.6],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 font-poppins transition-all duration-500 ${
        scrolled
          ? "bg-black/45 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.28)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-20 sm:h-24">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#accueil"
          className="font-poppins text-2xl sm:text-3xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F97316] rounded-sm drop-shadow-sm"
        >
          {celebrantName}
          <span className="text-[#F97316]">.</span>
        </a>

        {/* Zone 2: Desktop Navigation */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80"
        >
          {PRIMARY_NAV.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative py-1.5 transition-colors duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F97316] rounded-sm ${
                  isActive
                    ? "text-white font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#F97316]"
                    : "hover:text-white"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#confirmation"
            className="hidden sm:inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#C2410C] rounded-full transition-all duration-300 shadow-[0_8px_28px_rgba(249,115,22,0.35)] hover:shadow-[0_12px_36px_rgba(249,115,22,0.5)] hover:-translate-y-0.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
          >
            Je confirme ma présence
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/20 bg-black/40 backdrop-blur-md text-white hover:border-[#F97316] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-menu"
          aria-label="Menu mobile"
          className="md:hidden bg-[#181818]/95 backdrop-blur-xl border-b border-white/10 px-4 pt-2 pb-6 shadow-2xl"
        >
          <ul className="flex flex-col space-y-1">
            {MOBILE_ALL_NAV.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[#F97316]/20 text-[#F97316] font-semibold"
                        : "text-white/90 hover:bg-white/5"
                    }`}
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 pt-4 border-t border-white/10">
            <a
              href="#confirmation"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center px-5 py-3.5 text-base font-semibold text-white bg-[#F97316] hover:bg-[#C2410C] rounded-xl transition-colors shadow-md"
            >
              Je confirme ma présence
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
