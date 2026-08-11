import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Clock, Users, Award } from "lucide-react";
import { getCourses } from "../api/client";
import { useSettings } from "../context/SettingsContext";

export default function ProgramsOverview() {
  const [programs, setPrograms] = useState([]);
  const { isPageEnabled } = useSettings();
  const enabled = isPageEnabled("programs");

  useEffect(() => {
    if (enabled) getCourses().then(setPrograms);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 transition-colors duration-300">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          {/* <p className="font-mono text-xs tracking-[0.2em] text-[#D9383A] dark:text-[#3B82F6] uppercase mb-2 font-semibold">
            01 — Academics
          </p> */}
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Academic Programs
          </h2>
        </div>

        {/* View All Link */}
        <Link
          to="/programs"
          className="group flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-navy-100 hover:text-[#D9383A] dark:hover:text-[#3B82F6] transition-colors"
        >
          <span>View all</span>
          <ArrowUpRight
            size={16}
            className="text-slate-400 dark:text-navy-100/70 group-hover:text-[#D9383A] dark:group-hover:text-[#3B82F6] transition-colors"
          />
        </Link>
      </div>

      {/* Programs Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Regular Degree Programs */}
        {programs.map((p) => (
          <Link
            key={p.slug}
            to={`/programs/${p.slug}`}
            className="group flex flex-col justify-between rounded-2xl p-6 bg-white dark:bg-navy-900/90 border border-slate-200/80 dark:border-navy-700 border-b-2 border-b-transparent dark:border-b-transparent hover:border-b-[#D9383A] dark:hover:border-b-[#3B82F6] shadow-xs hover:shadow-md dark:shadow-navy-950/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-[#1E3A8A] dark:text-white group-hover:text-[#D9383A] dark:group-hover:text-[#3B82F6] transition-colors">
                  {p.name}
                </h3>
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-navy-800 group-hover:bg-[#D9383A] dark:group-hover:bg-[#3B82F6] transition-colors shrink-0">
                  <ArrowUpRight
                    size={16}
                    className="text-[#1E3A8A] dark:text-[#3B82F6] group-hover:text-white dark:group-hover:text-white transition-colors"
                  />
                </div>
              </div>

              <p className="text-sm text-[#D9383A] dark:text-[#3B82F6] font-semibold mt-1">
                {p.tagline}
              </p>

              <p className="text-sm text-slate-600 dark:text-navy-100 mt-3 leading-relaxed line-clamp-3">
                {p.description}
              </p>
            </div>

            {/* Card Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-700/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-navy-100/70">
              <span className="flex items-center gap-1.5">
                <Clock
                  size={14}
                  className="text-[#1E3A8A] dark:text-[#3B82F6]"
                />
                {p.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Users
                  size={14}
                  className="text-[#1E3A8A] dark:text-[#3B82F6]"
                />
                {p.seats} seats
              </span>
            </div>
          </Link>
        ))}

        {/* Non-Credit Course (NCC) Card */}
        <Link
          to="/programs/non-credit"
          className="group flex flex-col justify-between rounded-2xl p-6 bg-white dark:bg-navy-900/90 border border-slate-200/80 dark:border-navy-700 border-b-2 border-b-transparent dark:border-b-transparent hover:border-b-[#D9383A] dark:hover:border-b-[#3B82F6] shadow-xs hover:shadow-md dark:shadow-navy-950/50 hover:-translate-y-1 transition-all duration-300"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-bold text-[#1E3A8A] dark:text-white group-hover:text-[#D9383A] dark:group-hover:text-[#3B82F6] transition-colors">
                Non-Credit Courses
              </h3>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-navy-800 group-hover:bg-[#D9383A] dark:group-hover:bg-[#3B82F6] transition-colors shrink-0">
                <ArrowUpRight
                  size={16}
                  className="text-[#1E3A8A] dark:text-[#3B82F6] group-hover:text-white dark:group-hover:text-white transition-colors"
                />
              </div>
            </div>

            <p className="text-sm text-[#D9383A] dark:text-[#3B82F6] font-semibold mt-1">
              Skill Enhancement &amp; Certifications
            </p>

            <p className="text-sm text-slate-600 dark:text-navy-100 mt-3 leading-relaxed line-clamp-3">
              Industry-aligned training programs, hands-on tech workshops, and
              skill booster certifications running alongside degree courses.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-700/80 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-navy-100/70">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#1E3A8A] dark:text-[#3B82F6]" />
              Flexible / Short-term
            </span>
            <span className="flex items-center gap-1.5">
              <Award size={14} className="text-[#1E3A8A] dark:text-[#3B82F6]" />
              Certified
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
