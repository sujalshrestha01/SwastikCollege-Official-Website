import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { resolveImageUrl } from "../api/client";
import { Section } from "./Visibility";
import img1 from "../../assets/img1.jpg";
import FlyingKites from "./FlyingKites";
import DriftingKite from "./DriftingKite";

function isDashainActive(theme) {
  if (!theme?.enabled) return false;

  // Manual activation: enabled means active.
  if (!theme.autoSchedule) return true;

  // Automatic activation requires both dates.
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

function HeroBackground({ images }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 opacity-[0.4] transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
            opacity: i === index ? 0.6 : 0,
          }}
          aria-hidden
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-marigold-400"
                  : "w-1.5 bg-navy-300/60 hover:bg-navy-200"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function Hero() {
  const { settings } = useSettings();

  const carouselImages = (settings.heroImages || []).map(resolveImageUrl);

  const fallbackImage = settings.heroImageUrl
    ? resolveImageUrl(settings.heroImageUrl)
    : img1;

  const images = carouselImages.length > 0 ? carouselImages : [fallbackImage];

  const dashainTheme = settings.dashainTheme || {};
  const dashainActive = isDashainActive(dashainTheme);

  return (
    <section className="relative overflow-hidden bg-navy-900 text-paper">
      <HeroBackground images={images} />

      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/20 to-navy-900/10"
        aria-hidden
      />


{dashainActive && dashainTheme.showFlyingKites && (
  <>
    <FlyingKites />

    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute left-[24%] top-[30%] hidden lg:block">
        <DriftingKite
          color="#168300"
          accent="#f5b82e"
          size={76}
        />
      </div>

      <div className="absolute right-[28%] bottom-[12%] hidden md:block">
        <DriftingKite
          color="#e30613"
          accent="#0ea5a4"
          size={58}
        />
      </div>
    </div>
  </>
)}

<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-28 sm:py-36 grid lg:grid-cols-2 gap-12 items-center">
          <div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
            {settings.heroHeadline}
          </h1>

          <p className="mt-6 text-white/90 text-base sm:text-lg max-w-xl">
            {settings.heroSubheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-marigold-500 hover:bg-marigold-600 text-navy-900 font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Apply for Admission
              <ArrowUpRight size={18} />
            </Link>

            <Link
              to={settings.heroCtaLink || "/programs"}
              className="inline-flex items-center gap-2 border-2 border-navy-300 bg-black/10 backdrop-blur-md hover:border-marigold-500 text-paper px-6 py-3 rounded-full transition-all text-sm font-medium"
            >
              {settings.heroCtaText || "Explore Programs"}
            </Link>
          </div>
        </div>

        <Section page="home" section="heroStatusLog">
          <div className="bg-navy-800/70 border border-navy-600 rounded-2xl p-5 font-mono text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-navy-600">
              <span className="w-2.5 h-2.5 rounded-full bg-marigold-300/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-navy-300/70" />
              <span className="ml-3 text-navy-300">college_status.log</span>
            </div>

            <ul className="space-y-2.5 text-navy-100">
              {(settings.heroStatusLog?.length
                ? settings.heroStatusLog
                : []
              ).map((row, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-navy-400">{row.label}</span>

                  <span
                    className={
                      row.label === "admissions" ? "text-marigold-300" : ""
                    }
                  >
                    {row.value ||
                      (row.label === "college"
                        ? settings.collegeShortName
                        : row.label === "affiliation"
                          ? settings.affiliation
                          : row.label === "contact"
                            ? settings.phone
                            : "")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>
    </section>
  );
}
