
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { getNotices, getEvents } from "../api/client";
import { useSettings } from "../context/SettingsContext";
import SectionKites from "./SectionKites";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEventStatus(event) {
  if (event.statusOverride && event.statusOverride !== "auto") {
    return event.statusOverride;
  }

  const eventDate = new Date(event.date);
  const now = new Date();
  const today = startOfToday();
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  if (eventDay < today) return "past";
  if (eventDate <= now) return "ongoing";

  return "upcoming";
}

export default function NewsEvents() {
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const { isPageEnabled, isSectionVisible } = useSettings();

  const noticesEnabled = isPageEnabled("notices");
  const upcomingEnabled = isSectionVisible("home", "upcomingEvents");

  useEffect(() => {
    let cancelled = false;

    if (noticesEnabled) {
      getNotices()
        .then((data) => {
          if (!cancelled) {
            setNotices((data || []).slice(0, 4));
          }
        })
        .catch((error) => {
          console.error("Failed to load notices:", error);
        });
    } else {
      setNotices([]);
    }

    if (upcomingEnabled) {
      getEvents()
        .then((data) => {
          if (cancelled) return;

          setEvents(
            (data || [])
              .filter((event) => getEventStatus(event) !== "past")
              .sort((a, b) => {
                const rank = {
                  ongoing: 0,
                  upcoming: 0,
                  completed: 1,
                };

                const ra = rank[getEventStatus(a)] ?? 0;
                const rb = rank[getEventStatus(b)] ?? 0;

                if (ra !== rb) return ra - rb;

                return new Date(a.date) - new Date(b.date);
              })
              .slice(0, 4),
          );
        })
        .catch((error) => {
          console.error("Failed to load events:", error);
        });
    } else {
      setEvents([]);
    }

    return () => {
      cancelled = true;
    };
  }, [noticesEnabled, upcomingEnabled]);

  if (!noticesEnabled && !upcomingEnabled) return null;

  return (
    <section className="relative isolate w-full overflow-hidden bg-slate-50 py-16 transition-colors duration-300 dark:bg-navy-900/90 sm:py-20">
      <SectionKites section="newsEvents" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Latest News &amp; Events
          </h2>
        </div>

        <div
          className={`grid gap-8 ${
            noticesEnabled && upcomingEnabled
              ? "lg:grid-cols-3"
              : "lg:grid-cols-1"
          }`}
        >
          {noticesEnabled && (
            <div
              className={`grid gap-4 sm:grid-cols-2 ${
                upcomingEnabled ? "lg:col-span-2" : ""
              }`}
            >
              {notices.map((n) => (
                <Link
                  key={n._id || n.id}
                  to="/notices"
                  className="group flex flex-col justify-between rounded-r-2xl rounded-l-md border-l-4 border-l-transparent bg-white p-5 shadow-xs transition-all duration-300 hover:border-l-[#D9383A] hover:shadow-md dark:bg-navy-800/80 dark:shadow-navy-950/50 dark:hover:border-l-[#3B82F6]"
                >
                  <div>
                    <span className="inline-block rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-[#D9383A] dark:border-blue-900/40 dark:bg-blue-950/50 dark:text-[#3B82F6]">
                      {n.category}
                    </span>

                    <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-[#D9383A] dark:text-white dark:group-hover:text-[#3B82F6]">
                      {n.title}
                    </h3>
                  </div>

                  <p className="mt-4 font-mono text-xs text-slate-500 dark:text-navy-100/70">
                    {formatDate(n.date)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {upcomingEnabled && (
            <div className="flex flex-col justify-between rounded-2xl bg-[#0F172A] p-6 text-white shadow-lg dark:bg-navy-950">
              <div>
                <div className="mb-6 flex items-center gap-2 text-white">
                  <CalendarDays
                    size={18}
                    className="text-[#D9383A] dark:text-[#3B82F6]"
                  />

                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Upcoming Events
                  </h3>
                </div>

                <ul className="space-y-4">
                  {events.map((e) => {
                    const status = getEventStatus(e);

                    const badgeClass =
                      status === "ongoing"
                        ? "animate-pulse border-emerald-700/60 bg-emerald-900/40 text-emerald-300"
                        : status === "completed"
                          ? "border-slate-600/60 bg-slate-800/70 text-slate-400"
                          : "border-slate-700/60 bg-slate-800 text-slate-400 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100/70";

                    const label =
                      status === "ongoing"
                        ? "Ongoing"
                        : status === "completed"
                          ? "Completed"
                          : formatDate(e.date);

                    return (
                      <li
                        key={e._id || e.id}
                        className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 last:border-0 last:pb-0 dark:border-navy-800"
                      >
                        <span className="text-sm font-medium leading-snug text-slate-200 dark:text-navy-100">
                          {e.title}
                        </span>

                        <span
                          className={`shrink-0 rounded border px-2 py-0.5 font-mono text-xs ${badgeClass}`}
                        >
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {noticesEnabled && (
          <Link
            to="/notices"
            className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 transition-colors hover:text-[#D9383A] dark:text-navy-100 dark:hover:text-[#3B82F6]"
          >
            <span>View full Notice Board</span>

            <ArrowUpRight
              size={16}
              className="text-slate-400 transition-colors group-hover:text-[#D9383A] dark:text-navy-100/70 dark:group-hover:text-[#3B82F6]"
            />
          </Link>
        )}
      </div>
    </section>
  );
}
