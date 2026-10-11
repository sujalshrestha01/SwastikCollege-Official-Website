
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Kite, { TAIL_SHAPES } from "./Kite";

export default function DriftingKite(props) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const context = gsap.context(() => {
      const drift = () => {
        gsap.to(element, {
          x: gsap.utils.random(-18, 18),
          y: gsap.utils.random(-16, 12),
          rotation: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(1.6, 2.6),
          ease: "sine.inOut",
          onComplete: drift,
        });
      };

      drift();

      gsap.to("[data-kite-body]", {
        scaleX: 0.9,
        skewY: 3,
        svgOrigin: "50 0",
        duration: 0.28,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap
        .timeline({ repeat: -1, yoyo: true })
        .to("[data-kite-tail-path]", {
          attr: { d: TAIL_SHAPES[1] },
          duration: 0.45,
          ease: "sine.inOut",
        })
        .to("[data-kite-tail-path]", {
          attr: { d: TAIL_SHAPES[2] },
          duration: 0.45,
          ease: "sine.inOut",
        });

      gsap.to("[data-kite-tail]", {
        rotation: 14,
        svgOrigin: "50 100",
        duration: 0.9,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, element);

    return () => {
      context.revert();
      gsap.killTweensOf(element);
    };
  }, []);

  return (
    <div ref={ref}>
      <Kite {...props} />
    </div>
  );
}
