import { useEffect, useRef, useState, useCallback } from "react";
import { Quote, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { getTestimonials } from "../api/client";

const GAP_PX = 24; // matches the gap-6 below
const SPEED_PX_PER_FRAME = 0.6; // continuous drift speed while playing
const STEP_DURATION_MS = 350; // arrow-click glide duration

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  const firstCardRef = useRef(null);
  const rafRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    getTestimonials().then((data) => setTestimonials(data || []));
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const wrap = useCallback(() => {
    const track = trackRef.current;

    if (!track || testimonials.length === 0) return;

    const firstCard = track.children[0];
    const secondSetFirstCard = track.children[testimonials.length];

    if (!firstCard || !secondSetFirstCard) return;

    // Get the exact distance between the first card
    // and the first card of the duplicated set.
    const singleSetWidth = secondSetFirstCard.offsetLeft - firstCard.offsetLeft;

    // When we reach the second copy, move back by
    // exactly one complete set.
    if (track.scrollLeft >= singleSetWidth) {
      track.scrollLeft -= singleSetWidth;
    }
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length === 0) return;

    let animationFrame;

    const tick = () => {
      const track = trackRef.current;

      if (track && !isPausedRef.current) {
        track.scrollLeft += SPEED_PX_PER_FRAME;

        const firstCard = track.children[0];
        const secondSetFirstCard = track.children[testimonials.length];

        if (firstCard && secondSetFirstCard) {
          // Calculate the actual rendered width of one complete set.
          const singleSetWidth =
            secondSetFirstCard.offsetLeft - firstCard.offsetLeft;

          // As soon as the second copy starts,
          // jump back by exactly one set.
          if (track.scrollLeft >= singleSetWidth) {
            track.scrollLeft -= singleSetWidth;
          }
        }
      }

      animationFrame = requestAnimationFrame(tick);
      rafRef.current = animationFrame;
    };

    animationFrame = requestAnimationFrame(tick);
    rafRef.current = animationFrame;

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [testimonials.length]);

  function animateScrollBy(delta) {
    const track = trackRef.current;
    if (!track) return;

    const start = track.scrollLeft;
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / STEP_DURATION_MS, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      track.scrollLeft = start + delta * eased;

      // Keep the carousel inside the infinite loop.
      wrap();

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }
  function step(direction) {
    const card = firstCardRef.current;

    if (!card) return;

    const cardStep = card.offsetWidth + GAP_PX;

    animateScrollBy(direction * cardStep);
  }

  if (!testimonials.length) return null;

  // Create multiple copies so there is always another set
  // available while the carousel is continuously moving.
  const looped = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 transition-colors duration-300">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="font-mono text-xs tracking-[0.2em] text-[#D9383A] dark:text-[#3B82F6] uppercase mb-2 font-semibold">
          Voices
        </p>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Alumni Success Stories
        </h2>

        <p className="text-sm text-slate-600 dark:text-navy-100 mt-2 max-w-xl mx-auto">
          Hear what our graduates have to say about their journey and
          experiences with us.
        </p>
      </div>

      <div ref={trackRef} className="flex gap-6 overflow-hidden">
        {looped.map((t, i) => (
          <figure
            key={`${t._id || t.id}-${i}`}
            ref={i === 0 ? firstCardRef : null}
            className="shrink-0 w-[320px] sm:w-[360px] flex flex-col justify-between rounded-2xl p-6 bg-white dark:bg-navy-900/90 border border-slate-200/80 dark:border-navy-700 border-b-2 border-b-transparent dark:border-b-transparent shadow-xs hover:shadow-md dark:shadow-navy-950/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-navy-800 w-fit">
                <Quote
                  size={16}
                  className="text-[#1E3A8A] dark:text-[#3B82F6]"
                />
              </div>

              <blockquote className="text-sm text-slate-600 dark:text-navy-100 mt-4 leading-relaxed italic line-clamp-6">
                "{t.quote}"
              </blockquote>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-700/80">
              <p className="font-display text-sm font-bold text-[#1E3A8A] dark:text-white">
                {t.name}
              </p>

              <p className="text-xs font-mono text-slate-500 dark:text-navy-100/70 mt-0.5">
                {t.role}
              </p>
            </div>
          </figure>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => step(-1)}
          aria-label="Previous"
          className="w-10 h-10 rounded-full border border-slate-200/80 dark:border-navy-700 flex items-center justify-center text-slate-600 dark:text-navy-100 hover:border-[#D9383A] dark:hover:border-[#3B82F6] hover:text-[#D9383A] dark:hover:text-[#3B82F6] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Resume" : "Pause"}
          className="w-10 h-10 rounded-full bg-[#D9383A] dark:bg-[#3B82F6] text-white flex items-center justify-center hover:bg-[#b92e30] dark:hover:bg-[#2563eb] transition-colors"
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>

        <button
          onClick={() => step(1)}
          aria-label="Next"
          className="w-10 h-10 rounded-full border border-slate-200/80 dark:border-navy-700 flex items-center justify-center text-slate-600 dark:text-navy-100 hover:border-[#D9383A] dark:hover:border-[#3B82F6] hover:text-[#D9383A] dark:hover:text-[#3B82F6] transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
