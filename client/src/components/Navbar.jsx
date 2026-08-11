import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { resolveImageUrl } from "../api/client";
import logo from "../../assets/swastik-logo.png";
import NotificationTicker from "./NotificationTicker";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

const ALL_LINKS = [
  { to: "/", label: "Home" },
  { to: "/programs", label: "Academics", page: "programs" },
  { to: "/notices", label: "Notice Board", page: "notices" },
  { to: "/downloads", label: "Downloads", page: "downloads" },
  { to: "/blog", label: "Blog", page: "blog", featureKey: "blogDisabled" }, // Feature-flagged link
  { to: "/about", label: "About", page: "about" },
  { to: "/gallery", label: "Gallery", page: "gallery" },
  { to: "/faculty", label: "Faculty", page: "faculty" },
  { to: "/contact", label: "Contact", page: "contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { settings, isPageEnabled } = useSettings();

  // Stop the page underneath from scrolling while the mobile dropdown
  // menu is open.
  useLockBodyScroll(open);

  // Filter out feature-flagged links, and links to pages an admin has
  // turned off entirely via the visibility toggles.
  const navLinks = ALL_LINKS.filter((link) => {
    if (link.featureKey && settings?.features?.[link.featureKey]) return false;
    if (link.page && !isPageEnabled(link.page)) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-paper/90 dark:bg-navy-900/90 backdrop-blur border-b border-navy-100 dark:border-navy-700 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[4rem] h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => {
            setOpen(false);

            // If already on the home page, scroll smoothly to the top
            if (window.location.pathname === "/") {
              e.preventDefault();

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }}
        >
          <img
            src={settings?.logoUrl ? resolveImageUrl(settings.logoUrl) : logo}
            alt="Logo"
            className="h-8 sm:h-9 lg:h-10 w-auto object-contain transition-all"
          />
        </Link>
        {/* brightness and glow effect on logo */}
        {/* <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setOpen(false)}
        >
          <img
            src={settings?.logoUrl ? resolveImageUrl(settings.logoUrl) : logo}
            alt="Logo"
            className="h-8 sm:h-9 lg:h-10 w-auto object-contain transition-all dark:brightness-105 dark:drop-shadow-[0_0_16px_rgba(255,255,255,0.6)]"
          />
        </Link> */}

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-3 lg:gap-6 xl:gap-8 min-w-0">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-[#D9383A] dark:text-marigold-300"
                    : "text-navy-600 dark:text-navy-100 hover:text-[#D9383A] dark:hover:text-marigold-300"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
        {/* Action Controls */}
        <div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full text-navy-600 dark:text-navy-100 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors shrink-0"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/contact"
            className="bg-marigold hover:bg-marigold-500 text-navy-900 font-semibold text-xs lg:text-sm px-3.5 lg:px-4 py-2 rounded-full transition-colors whitespace-nowrap shrink-0"
          >
            Apply Now
          </Link>
        </div>
        {/* Mobile Hamburger Toggle */}
        <button
          className="lg:hidden p-2 text-navy-700 dark:text-paper focus:outline-hidden active:scale-90 transition-transform"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="lg:hidden border-t border-navy-100 dark:border-navy-700 bg-paper dark:bg-navy-900 px-4 pb-5 pt-2 max-h-[85vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 text-sm font-medium border-b border-navy-100/60 dark:border-navy-700/60 ${
                    isActive
                      ? "text-[#D9383A] dark:text-marigold-300"
                      : "text-navy-700 dark:text-navy-100"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            <div className="flex items-center justify-between pt-4 mt-1">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm font-medium text-navy-600 dark:text-navy-100 p-1"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </button>

              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="bg-marigold text-navy-900 font-semibold text-xs px-4 py-2 rounded-full"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
