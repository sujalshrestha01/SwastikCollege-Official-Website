import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { ChevronDown } from "lucide-react";

// A single "Research ▾" style dropdown for the desktop navbar. Kept generic
// (label + list of {to, label}) so it isn't tied to the Research menu
// specifically, even though that's the only user today.
export default function NavDropdown({ label, items, active }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const location = useLocation();

  // Close on outside click.
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close whenever the route changes (e.g. a dropdown link was clicked).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (items.length === 0) return null;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
          active
            ? "text-[#D9383A] dark:text-marigold-300"
            : "text-navy-600 dark:text-navy-100 hover:text-[#D9383A] dark:hover:text-marigold-300"
        }`}
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 min-w-[200px] rounded-2xl bg-white dark:bg-navy-800 shadow-xl border border-navy-100 dark:border-navy-700 py-2 z-50 animate-[fadeIn_0.15s_ease-out]">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#D9383A] dark:text-marigold-300"
                    : "text-navy-700 dark:text-navy-100 hover:bg-navy-50 dark:hover:bg-navy-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
