import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Clock, Users, Award } from "lucide-react";
import { getCourses } from "../api/client";
import { Section } from "../components/Visibility";
import Reveal from "../components/Reveal";
import SEO from "../components/SEO";

export default function Programs() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    getCourses().then(setPrograms);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SEO
        title="Academic Programs — BSc. CSIT & BCA College in Kathmandu, Nepal"
        description="Explore Swastik College's TU-affiliated academic programs: BSc. CSIT and BCA, each with semester-wise curriculum, entrance requirements and downloadable syllabus."
        path="/programs"
        keywords="BSc CSIT Nepal, BCA Nepal, Nepal, Swastik College programs, TU affiliated programs"
      />
      {/* Page Header */}
      <Section page="programs" section="hero">
        <p className="font-mono text-xs tracking-[0.2em] text-[#D9383A] dark:text-blue-400 uppercase mb-2 font-semibold">
          Academics
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Academic Programs
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mb-10 leading-relaxed">
          TU-affiliated programs, each with semester-wise curriculum and
          downloadable syllabus.
        </p>
      </Section>

      {/* Programs Grid */}
      <Section page="programs" section="list">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dynamic Degree Courses */}
          {programs.map((p, i) => (
            <Reveal key={p.slug} delay={i * 70}>
              <Link
                to={`/programs/${p.slug}`}
                className="group flex flex-col justify-between rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-b-2 border-b-transparent hover:border-b-[#D9383A] dark:hover:border-b-blue-500 dark:hover:bg-slate-800/90 shadow-sm hover:shadow-xl dark:hover:shadow-blue-950/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  {/* Card Header & Arrow Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-[#1E3A8A] dark:text-blue-400 group-hover:text-[#D9383A] dark:group-hover:text-blue-300 transition-colors">
                      {p.name}
                    </h3>
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/80 group-hover:bg-[#D9383A] dark:group-hover:bg-blue-600 transition-colors shrink-0">
                      <ArrowUpRight
                        size={16}
                        className="text-[#1E3A8A] dark:text-blue-400 group-hover:text-white dark:group-hover:text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Tagline Accent */}
                  <p className="text-sm text-[#D9383A] dark:text-blue-400 font-semibold mt-1">
                    {p.tagline}
                  </p>

                  {/* Course Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed line-clamp-3">
                    {p.description}
                  </p>
                </div>

                {/* Card Footer Details */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock
                      size={14}
                      className="text-[#1E3A8A] dark:text-blue-400"
                    />
                    {p.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users
                      size={14}
                      className="text-[#1E3A8A] dark:text-blue-400"
                    />
                    {p.seats} seats
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}

          {/* Linked Non-Credit Course (NCC) Card */}
          <Reveal delay={programs.length * 70}>
            <Link
              to="/programs/non-credit"
              className="group flex flex-col justify-between rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-b-2 border-b-transparent hover:border-b-[#D9383A] dark:hover:border-b-blue-500 dark:hover:bg-slate-800/90 shadow-sm hover:shadow-xl dark:hover:shadow-blue-950/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-[#1E3A8A] dark:text-blue-400 group-hover:text-[#D9383A] dark:group-hover:text-blue-300 transition-colors">
                    Non-Credit Courses
                  </h3>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-800/80 group-hover:bg-[#D9383A] dark:group-hover:bg-blue-600 transition-colors shrink-0">
                    <ArrowUpRight
                      size={16}
                      className="text-[#1E3A8A] dark:text-blue-400 group-hover:text-white dark:group-hover:text-white transition-colors"
                    />
                  </div>
                </div>

                <p className="text-sm text-[#D9383A] dark:text-blue-400 font-semibold mt-1">
                  Skill Enhancement &amp; Certifications
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed line-clamp-3">
                  Industry-aligned training programs, hands-on tech workshops,
                  and skill booster certifications running alongside degree
                  courses.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock
                    size={14}
                    className="text-[#1E3A8A] dark:text-blue-400"
                  />
                  Flexible / Short-term
                </span>
                <span className="flex items-center gap-1.5">
                  <Award
                    size={14}
                    className="text-[#1E3A8A] dark:text-blue-400"
                  />
                  Certified
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
