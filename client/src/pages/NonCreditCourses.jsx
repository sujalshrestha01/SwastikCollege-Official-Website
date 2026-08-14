import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  Sparkles,
  BookOpen,
  UserCheck,
  Bell,
  ExternalLink,
} from "lucide-react";
import { getSkillCourses, getWorkshops, resolveImageUrl } from "../api/client";
import SEO from "../components/SEO";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NonCreditCourses() {
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [courses, setCourses] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSkillCourses(), getWorkshops()]).then(([c, w]) => {
      setCourses(c || []);
      setWorkshops(w || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <SEO
        title="Skill Courses & Workshops"
        description="Explore short-term skill courses and workshops offered by Swastik College, Kathmandu — practical, industry-aligned training beyond the regular degree programs."
        path="/programs/non-credit"
        keywords="Swastik College workshops, Swastik College skill courses, non-credit courses Nepal"
      />
      {/* Top Header */}
      <div className="mb-10">
        <Link
          to="/programs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#D9383A] transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Academic Programs
        </Link>
        <p className="font-mono text-xs tracking-[0.2em] text-[#D9383A] uppercase font-semibold mb-2">
          Skill Enhancement
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Non-Credit Courses &amp; Live Workshops
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
          Overview of college certification courses alongside upcoming
          interactive workshops for hands-on technical skills.
        </p>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CERTIFICATION COURSES (Takes 8/12 space) */}
        <section className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
            <BookOpen className="text-[#1E3A8A] dark:text-blue-400" size={22} />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Certification Courses
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core academic skill tracks taught directly on campus.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-slate-400">
              No certification courses published yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {courses.map((course) => {
                // Show duration only if non-empty string exists
                const hasDuration = Boolean(
                  course.duration && course.duration.trim().length > 0,
                );

                return (
                  <div
                    key={course._id}
                    className="group flex items-stretch bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-xs overflow-hidden"
                  >
                    {/* FULL-HEIGHT COVER IMAGE ON LEFT EDGE */}
                    <div className="w-28 sm:w-36 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                      {course.logoUrl ? (
                        <img
                          src={resolveImageUrl(course.logoUrl)}
                          alt={course.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <BookOpen
                          size={28}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      )}
                    </div>

                    {/* TEXT DETAILS ON THE RIGHT WITH INTERNAL PADDING */}
                    <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize leading-snug truncate">
                            {course.name}
                          </h3>

                          {/* Conditional Duration Badge */}
                          {hasDuration && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                              {course.duration}
                            </span>
                          )}
                        </div>

                        {course.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: LIVE WORKSHOPS (Takes 4/12 space) */}
        <section className="lg:col-span-4">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="text-[#D9383A]" size={20} />
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Live Workshops
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Short-term bootcamps
                </p>
              </div>
            </div>
            {workshops.length > 0 && (
              <span className="bg-red-50 dark:bg-red-950/40 text-[#D9383A] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-900/60">
                {workshops.length} Active
              </span>
            )}
          </div>

          {/* Workshop Stack */}
          {workshops.length > 0 ? (
            <div className="space-y-4">
              {workshops.map((ws) => (
                <div
                  key={ws._id}
                  className="group relative flex flex-col justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#D9383A] transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 shrink-0">
                      {ws.logoUrl && (
                        <img
                          src={resolveImageUrl(ws.logoUrl)}
                          alt={ws.name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white leading-tight mb-0.5">
                        {ws.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                        {ws.description}
                      </p>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-[#D9383A]" />
                      {formatDate(ws.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock
                        size={12}
                        className="text-[#1E3A8A] dark:text-blue-400"
                      />
                      {ws.duration}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedWorkshop(ws)}
                    className="w-full py-1.5 px-3 bg-[#D9383A] hover:bg-[#b82b2d] text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck size={13} /> Enroll Now
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State when no workshops are active */
            !loading && (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Bell size={18} />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  No active workshops today
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Workshops are announced periodically. Stay tuned for upcoming
                  live sessions.
                </p>
                <Link
                  to="/contact"
                  className="block w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  Get Notified
                </Link>
              </div>
            )
          )}
        </section>
      </div>

      {/* Workshop Enrollment Modal Only */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedWorkshop(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                {selectedWorkshop.logoUrl && (
                  <img
                    src={resolveImageUrl(selectedWorkshop.logoUrl)}
                    alt={selectedWorkshop.name}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-semibold text-[#D9383A] uppercase tracking-wider">
                  {selectedWorkshop.type}
                </span>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {selectedWorkshop.name}
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              {selectedWorkshop.description}
            </p>

            {selectedWorkshop.highlights?.length > 0 && (
              <div className="space-y-2 mb-6">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                  Workshop Agenda
                </p>
                {selectedWorkshop.highlights.map((topic, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-[#D9383A] shrink-0"
                    />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-500">
                Duration: {selectedWorkshop.duration}
              </span>
              {selectedWorkshop.enrollUrl ? (
                <a
                  href={selectedWorkshop.enrollUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSelectedWorkshop(null)}
                  className="inline-flex items-center gap-1.5 py-2.5 px-5 bg-[#D9383A] hover:bg-[#b82b2d] text-white font-semibold rounded-lg transition-colors text-xs"
                >
                  Enroll via Form <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Enrollment link coming soon
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
