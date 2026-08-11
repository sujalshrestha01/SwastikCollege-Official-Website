import { useEffect, useRef, useState } from "react";

/**
 * Fades + slides its children into place the first time they scroll into
 * view. One-shot — it doesn't replay every time you scroll back past it,
 * which keeps it feeling subtle instead of gimmicky. Pure CSS transition,
 * no animation library, so it stays lightweight. Automatically respects
 * prefers-reduced-motion via the global override in index.css.
 *
 *   <Reveal><SomeSection /></Reveal>
 *
 *   // Stagger a grid of cards:
 *   {items.map((item, i) => (
 *     <Reveal key={item.id} delay={i * 60}><Card {...item} /></Reveal>
 *   ))}
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // If the browser doesn't support IntersectionObserver for some reason,
    // just show the content immediately rather than leaving it hidden.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
