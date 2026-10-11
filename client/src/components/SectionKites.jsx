
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSettings } from "../context/SettingsContext";
import DriftingKite from "./DriftingKite";

const PRESETS = {
  quickAccess: [
    {
      left: "1%",
      top: "8%",
      size: 76,
      color: "#e30613",
      accent: "#f5b82e",
    },
    {
      right: "1%",
      bottom: "8%",
      size: 70,
      color: "#168300",
      accent: "#0ea5a4",
    },
  ],

  whyChooseUs: [
    {
      left: "1%",
      top: "12%",
      size: 82,
      color: "#e30613",
      accent: "#f5b82e",
    },
    {
      right: "1%",
      bottom: "12%",
      size: 76,
      color: "#168300",
      accent: "#0ea5a4",
    },
  ],


programs: [
  {
    left: "-1%",
    top: "12%",
    size: 76,
    color: "#f5b82e",
    accent: "#e30613",
  },
  {
    right: "-1%",
    bottom: "8%",
    size: 76,
    color: "#e30613",
    accent: "#0ea5a4",
  },
],


  experience: [
    {
      left: "1%",
      top: "18%",
      size: 82,
      color: "#168300",
      accent: "#f5b82e",
    },
    {
      right: "1%",
      bottom: "15%",
      size: 74,
      color: "#e30613",
      accent: "#0ea5a4",
    },
  ],

  newsEvents: [
    {
      left: "1%",
      top: "12%",
      size: 76,
      color: "#f5b82e",
      accent: "#e30613",
    },
    {
      right: "1%",
      bottom: "12%",
      size: 82,
      color: "#168300",
      accent: "#0ea5a4",
    },
  ],

  default: [
    {
      left: "1%",
      top: "20%",
      size: 70,
      color: "#e30613",
      accent: "#f5b82e",
    },
    {
      right: "1%",
      bottom: "15%",
      size: 70,
      color: "#168300",
      accent: "#0ea5a4",
    },
  ],
};

function isDashainActive(theme) {
  if (!theme?.enabled) return false;

  if (theme.autoSchedule === false) return true;

  if (!theme.startDate || !theme.endDate) return false;

  const now = new Date();
  const start = new Date(`${theme.startDate}T00:00:00`);
  const end = new Date(`${theme.endDate}T23:59:59.999`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return false;
  }

  return now >= start && now <= end;
}

export default function SectionKites({ section = "default" }) {
  const rootRef = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const { settings } = useSettings();
  const theme = settings?.dashainTheme || {};

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark"),
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

  const positions = PRESETS[section] || PRESETS.default;

  useEffect(() => {
    const root = rootRef.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const context = gsap.context(() => {
      root.querySelectorAll("[data-section-kite]").forEach((kite, index) => {
        gsap.fromTo(
          kite,
          {
            opacity: 0,
            x: index % 2 === 0 ? -18 : 18,
            y: 16,
            rotation: index % 2 === 0 ? -6 : 6,
          },
          {
            opacity: 1,
            x: index % 2 === 0 ? 10 : -10,
            y: index % 2 === 0 ? -12 : 12,
            rotation: index % 2 === 0 ? 5 : -5,
            duration: 1.2,
            delay: 0.15 * index,
            ease: "power2.out",
          },
        );

        gsap.to(kite, {
          x: index % 2 === 0 ? 12 : -12,
          y: index % 2 === 0 ? -14 : 14,
          rotation: index % 2 === 0 ? 5 : -5,
          duration: 3.8 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.2 + index * 0.25,
        });
      });
    }, root);

    return () => context.revert();
  }, [section, positions]);

  const alwaysShowForSections = ["programs", "whyChooseUs"].includes(section);

if (
  !alwaysShowForSections &&
  (
    !isDashainActive(theme) ||
    theme.showHomepageKites === false ||
    theme.showFlyingKites === false
  )
) {
  return null;
}

  const stringColor = isDark ? "#ffffff" : "#111827";

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {positions.map((kite, index) => (
        <div
          key={`${section}-${index}`}
          data-section-kite
          className="absolute"
          style={{
            left: kite.left,
            right: kite.right,
            top: kite.top,
            bottom: kite.bottom,
            opacity: 0,
            willChange: "transform, opacity",
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
