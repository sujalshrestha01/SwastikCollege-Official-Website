
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSettings } from "../context/SettingsContext";
import DriftingKite from "./DriftingKite";

function isDashainActive(theme) {
  if (!theme?.enabled) return false;

  if (!theme.autoSchedule) return true;

  if (!theme.startDate || !theme.endDate) return false;

  const now = new Date();
  const start = new Date(`${theme.startDate}T00:00:00`);
  const end = new Date(`${theme.endDate}T23:59:59.999`);

  return (
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    end >= start &&
    now >= start &&
    now <= end
  );
}


const KITE_POSITIONS = [
  // Hero transition and Why Choose Us
  { left: "4%", top: "8%", color: "#f20d20", accent: "#ffd43b", size: 62 },
  { left: "88%", top: "13%", color: "#159b16", accent: "#00d6d6", size: 58 },

  // Open spaces around programs
  { left: "3%", top: "25%", color: "#ffbd16", accent: "#f20d20", size: 52 },
  { left: "91%", top: "31%", color: "#f20d20", accent: "#00d6d6", size: 48 },

  // Swastik Experience
  { left: "10%", top: "42%", color: "#159b16", accent: "#ffd43b", size: 54 },
  { left: "85%", top: "47%", color: "#ffbd16", accent: "#f20d20", size: 48 },

  // Latest News and Events
  { left: "4%", top: "59%", color: "#f20d20", accent: "#ffd43b", size: 50 },
  { left: "91%", top: "64%", color: "#159b16", accent: "#00d6d6", size: 54 },

  // Lower homepage sections
  { left: "13%", top: "74%", color: "#ffbd16", accent: "#f20d20", size: 46 },
  { left: "84%", top: "79%", color: "#f20d20", accent: "#00d6d6", size: 48 },
  { left: "5%", top: "89%", color: "#159b16", accent: "#ffd43b", size: 42 },
  { left: "90%", top: "94%", color: "#ffbd16", accent: "#f20d20", size: 40 },
];




export default function HomepageKites() {
  const rootRef = useRef(null);
  const [isDark, setIsDark] = useState(false);

  const { settings } = useSettings();
  const theme = settings.dashainTheme || {};
  const active = isDashainActive(theme);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (
      !root ||
      !active ||
      theme.showHomepageKites === false ||
      !theme.showFlyingKites ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const context = gsap.context(() => {
      root.querySelectorAll("[data-homepage-kite]").forEach((kite, index) => {
        gsap.to(kite, {
          x: index % 2 === 0 ? 10 : -10,
          y: index % 2 === 0 ? -12 : 12,
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.3,
        });
      });
    }, root);

    return () => context.revert();
  }, [
    active,
    theme.showHomepageKites,
    theme.showFlyingKites,
    theme.homepageKiteCount,
  ]);

  if (
    !active ||
    theme.showHomepageKites === false ||
    !theme.showFlyingKites
  ) {
    return null;
  }

const count = Math.min(
  Math.max(Number(theme.homepageKiteCount) || 6, 2),
  KITE_POSITIONS.length
);
  const stringColor = isDark ? "#ffffff" : "#000000";

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {KITE_POSITIONS.slice(0, count).map((kite, index) => (
        <div
          key={index}
          data-homepage-kite
          className="absolute"
          style={{
            left: kite.left,
            top: kite.top,
            willChange: "transform",
          }}
        >
          <DriftingKite
            color={kite.color}
            accent={kite.accent}
            size={kite.size}
            string={
              theme.showKiteStrings === false
                ? "none"
                : index % 2 === 0
                  ? "down-left"
                  : "down-right"
            }
            stringColor={stringColor}
          />
        </div>
      ))}
    </div>
  );
}
