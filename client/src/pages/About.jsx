import { useEffect, useState } from "react";
import aboutus1 from "../../assets/aboutus1.jpg";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Quote,
  Sparkles,
  Target,
  Trophy,
  Users,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import SEO from "../components/SEO";
import { useSettings } from "../context/SettingsContext";
import { getGalleryEvents, resolveImageUrl } from "../api/client";
import { Section } from "../components/Visibility";
import Testimonials from "../components/Testimonials";

// Maps icon name from database to Lucide React component
const ICON_MAP = {
  GraduationCap,
  Users,
  Lightbulb,
  HeartHandshake,
  Trophy,
  Target,
  Compass,
  BookOpenCheck,
};

// Color classes mapped per key with dark-mode optimized gradients and borders
const COLOR_MAP = {
  blue: "from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 dark:hover:border-blue-400/50",
  emerald:
    "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 dark:hover:border-emerald-400/50",
  amber:
    "from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 dark:hover:border-amber-400/50",
  rose: "from-rose-500/10 via-pink-500/5 to-transparent border-rose-500/20 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 dark:hover:border-rose-400/50",
};

export default function About() {
  const { settings } = useSettings();
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    getGalleryEvents().then((events) =>
      setGalleryImages((events || []).slice(0, 6)),
    );
  }, []);

  const timeline = settings.about?.timeline?.length
    ? settings.about.timeline
    : [];
  const values = settings.about?.values?.length ? settings.about.values : [];
  const leadership = settings.about?.leadership || {};

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <SEO
        title="About Us"
        description="Learn about Swastik College's history, mission, vision and leadership — a Tribhuvan University affiliated college in Kathmandu shaping careers since its founding."
        path="/about"
        keywords="about Swastik College, Swastik College history, Swastik College mission vision"
      />
      {/* ------------------------------------------------------------------ */}
      {/* 1. HERO SECTION                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Section page="about" section="hero">
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Left Header Copy */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 dark:bg-teal-500/10 border border-red-500/20 dark:border-teal-500/30 text-red-600 dark:text-teal-400 text-xs font-semibold tracking-wider uppercase">
                  <Sparkles size={14} />
                  <span>About {settings.collegeName || "Our Institution"}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  {settings.tagline || (
                    <>
                      Empowering Minds, <br />
                      <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500 dark:from-teal-400 dark:via-emerald-400 dark:to-amber-400 bg-clip-text text-transparent">
                        Shaping Tomorrows.
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {settings.aboutSummary ||
                    "Dedicated to delivering academic excellence, research-driven learning, and holistic personality development. We prepare students for dynamic careers in technology, management, and global leadership."}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/programs"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-medium text-sm px-6 py-3 rounded-xl shadow-lg shadow-teal-500/20 dark:shadow-teal-950/50 transition-all transform hover:-translate-y-0.5"
                  >
                    Explore Academic Programs
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:border-slate-700 font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs"
                  >
                    Contact Admissions
                  </Link>
                </div>
              </div>

              {/* Right Hero Frame */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group">
                  <img
                    src={aboutus1}
                    alt={settings.collegeName}
                    className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Floating Info Pill */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700/60 shadow-lg">
                    <p className="text-xs font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold">
                      Affiliation & Legacy
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">
                      {settings.affiliation ||
                        "Tribhuvan University Affiliated"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Est. {settings.establishedYear || "2005"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. MISSION & VISION SECTION                                        */}
      {/* ------------------------------------------------------------------ */}
      <Section page="about" section="missionVision">
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Our Purpose & Direction
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Guided by a clear roadmap to empower future professionals and
              visionary thinkers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-900/90 border border-teal-500/20 dark:border-teal-500/30 hover:border-teal-500/40 transition-all shadow-xs hover:shadow-xl dark:hover:shadow-teal-950/30 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 dark:bg-teal-600 text-white flex items-center justify-center mb-6 shadow-md shadow-teal-500/30 dark:shadow-teal-950/60">
                <Target size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Our Mission
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {settings.missionStatement ||
                  "To provide transformative higher education combining technical excellence, research capability, and ethical foundation. We aim to equip students with critical skills needed to thrive in modern global careers."}
              </p>
            </div>

            {/* Vision Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900/90 border border-amber-500/20 dark:border-amber-500/30 hover:border-amber-500/40 transition-all shadow-xs hover:shadow-xl dark:hover:shadow-amber-950/20 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 dark:bg-amber-600 text-white flex items-center justify-center mb-6 shadow-md shadow-amber-500/30 dark:shadow-amber-950/60">
                <Eye size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Our Vision
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {settings.visionStatement ||
                  "To be recognized as a premier educational landmark that inspires creative thinking, technological innovation, and sustainable leadership across diverse discipline boundaries."}
              </p>
            </div>
          </div>
        </section>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. CORE VALUES / FEATURES                                          */}
      {/* ------------------------------------------------------------------ */}
      <Section page="about" section="values">
        <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                What Sets Us Apart
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                The foundational pillars that define student life and academic
                learning on our campus.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, idx) => {
                const IconComponent = ICON_MAP[v.icon] || GraduationCap;
                const colorCls = COLOR_MAP[v.colorKey] || COLOR_MAP.blue;
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl bg-gradient-to-b ${colorCls} dark:bg-slate-900/90 border transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg dark:hover:shadow-slate-950/50`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs flex items-center justify-center mb-4">
                      <IconComponent size={20} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {v.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {v.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. HISTORY & TIMELINE                                              */}
      {/* ------------------------------------------------------------------ */}
      <Section page="about" section="journey">
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Our Journey
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              How we evolved from a modest initiative into an academic
              destination.
            </p>
          </div>

          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-32 space-y-12">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative pl-8 group">
                {/* Timeline Marker Bullet */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-teal-500 dark:bg-teal-400 border-4 border-slate-50 dark:border-slate-950 group-hover:scale-125 transition-transform" />

                {/* Year Floating Label */}
                <span className="md:absolute md:-left-28 md:top-0 font-mono text-sm font-extrabold text-teal-600 dark:text-teal-400 block mb-1 md:mb-0">
                  {item.year}
                </span>

                {/* Content Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md dark:hover:border-slate-700 transition">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. PRINCIPAL QUOTE / LEADERSHIP                                    */}
      {/* ------------------------------------------------------------------ */}
      <Section page="about" section="leadership">
        <section className="py-16 bg-slate-900 dark:bg-slate-900/90 border-y border-slate-800 text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <Quote
              size={40}
              className="mx-auto text-teal-400 opacity-80 mb-6"
            />
            <p className="text-xl sm:text-2xl font-medium leading-relaxed italic text-slate-200">
              "{leadership.text}"
            </p>
            <div className="mt-6">
              <h4 className="text-lg font-bold text-white">
                {leadership.author}
              </h4>
              <p className="text-xs text-teal-400 tracking-wider uppercase mt-0.5 font-medium">
                {leadership.role} — {settings.collegeName || "Our College"}
              </p>
            </div>
          </div>
        </section>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. GALLERY PREVIEW                                                 */}
      {/* ------------------------------------------------------------------ */}
      {galleryImages.length > 0 && (
        <Section page="gallery" section="grid">
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  College Life
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  A glimpse into our college culture, facilities, and
                  activities.
                </p>
              </div>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Explore Full Gallery <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((event, index) => (
                <Link
                  to="/gallery"
                  key={event._id || index}
                  className="group relative rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-slate-200 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 block shadow-xs hover:shadow-lg dark:hover:shadow-slate-950/60 transition-all"
                >
                  <img
                    src={resolveImageUrl(
                      event.thumbnailUrl || event.images?.[0]?.url,
                    )}
                    alt={event.title || "Campus Shot"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-medium truncate">
                      {event.title || "Campus View"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </Section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 7. TESTIMONIALS SECTION                                            */}
      {/* ------------------------------------------------------------------ */}
      <Testimonials />

      {/* ------------------------------------------------------------------ */}
      {/* 8. CALL TO ACTION                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-700 dark:from-teal-700 dark:to-emerald-800 text-white p-8 sm:p-12 shadow-2xl dark:shadow-teal-950/50 border border-teal-500/30 dark:border-teal-500/20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Start Your Journey With Us
            </h2>
            <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
              Admissions are open for upcoming academic sessions. Connect with
              our counseling team to choose the right path for your career.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Link
              to="/programs"
              className="bg-white text-teal-800 hover:bg-teal-50 dark:bg-slate-100 dark:text-teal-900 dark:hover:bg-white font-semibold text-sm px-6 py-3.5 rounded-xl transition shadow-md"
            >
              Browse Programs
            </Link>
            <Link
              to="/contact"
              className="bg-teal-800/60 hover:bg-teal-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-white border border-teal-400/30 font-semibold text-sm px-6 py-3.5 rounded-xl transition"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
