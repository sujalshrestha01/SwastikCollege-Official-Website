
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Kite, { TAIL_SHAPES } from "./Kite";
import { useSettings } from "../context/SettingsContext";

gsap.registerPlugin(ScrollTrigger);


const KITES = [
  {
    color: "#e30613",
    accent: "#f5b82e",
    size: 145,
    position: "left-[4%] top-[12%]",
    visibility: "hidden md:block",
    depth: 0.7,
  },
  {
    color: "#168300",
    accent: "#0ea5a4",
    size: 130,
    position: "right-[5%] top-[10%]",
    visibility: "hidden md:block",
    depth: 0.65,
  },
  {
    color: "#f5b82e",
    accent: "#e30613",
    size: 88,
    position: "left-[16%] bottom-[12%]",
    visibility: "hidden lg:block",
    depth: 0.45,
  },
  {
    color: "#e30613",
    accent: "#0ea5a4",
    size: 92,
    position: "right-[15%] bottom-[14%]",
    visibility: "hidden lg:block",
    depth: 0.5,
  },
  {
    color: "#0ea5a4",
    accent: "#f5b82e",
    size: 76,
    position: "left-[45%] top-[8%]",
    visibility: "hidden xl:block",
    depth: 0.35,
  },
];


function isDashainActive(theme) {
  if (!theme.enabled) return false;

  if (theme.autoSchedule === false) return true;

  if (!theme.startDate || !theme.endDate) return false;

  const now = new Date();
  const start = new Date(`${theme.startDate}T00:00:00`);
  const end = new Date(`${theme.endDate}T23:59:59.999`);

  return now >= start && now <= end;
}

export default function FlyingKites() {
  const containerRef = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const { settings } = useSettings();

  const theme = settings?.dashainTheme || {};

  const active = isDashainActive(theme) && theme.showFlyingKites !== false;

  const kiteCount = Math.min(
    Math.max(Number(theme.homepageKiteCount) || 6, 2),
    KITES.length,
  );

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

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !active) return undefined;

    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const context = gsap.context(() => {
      const kiteElements = gsap.utils.toArray(
        container.querySelectorAll("[data-flying-kite]"),
      );

      kiteElements.forEach((kiteElement, index) => {
        const body = kiteElement.querySelector("[data-kite-body]");
        const tail = kiteElement.querySelector("[data-kite-tail-path]");
        const string = kiteElement.querySelector("[data-kite-string]");
        const kiteConfig = KITES[index];

        if (!body || !kiteConfig) return;

        gsap.set(kiteElement, {
          x: index % 2 === 0 ? -12 : 12,
          y: 12,
          rotation: index % 2 === 0 ? -5 : 5,
          transformOrigin: "50% 50%",
        });

        if (mediaQuery.matches) {
          gsap.set(kiteElement, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1,
          });

          return;
        }

        gsap.to(kiteElement, {
          x: index % 2 === 0 ? 14 : -14,
          y: index % 2 === 0 ? -18 : 16,
          rotation: index % 2 === 0 ? 7 : -7,
          duration: 3.5 + index * 0.45,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.35,
        });

        gsap.to(body, {
          rotation: index % 2 === 0 ? 5 : -5,
          transformOrigin: "50% 50%",
          duration: 2.5 + index * 0.25,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        });

        if (tail) {
          gsap.to(tail, {
            duration: 1.4 + index * 0.12,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            attr: {
              d: TAIL_SHAPES[(index + 1) % TAIL_SHAPES.length],
            },
          });
        }

        if (string && theme.showKiteStrings !== false) {
          gsap.to(string, {
            rotation: index % 2 === 0 ? 4 : -4,
            transformOrigin: "50% 0%",
            duration: 2 + index * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }

        gsap.fromTo(
          kiteElement,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            delay: 0.15 * index,
            ease: "power2.out",
            clearProps: "scale",
          },
        );

        gsap.to(kiteElement, {
          yPercent: -8 * kiteConfig.depth,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });
    }, container);

    return () => context.revert();
  }, [active, kiteCount, theme.showKiteStrings]);

  if (!active) return null;

  const stringColor = isDark ? "#ffffff" : "#000000";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {KITES.slice(0, kiteCount).map((kite, index) => (
        <div
          key={`${kite.color}-${index}`}
          data-flying-kite
          className={`absolute ${kite.position} ${kite.visibility}`}
          style={{
            opacity: 0,
            willChange: "transform",
          }}
        >
          <Kite
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
