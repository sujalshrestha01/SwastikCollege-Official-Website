import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getGalleryEvents, resolveImageUrl } from "../api/client";

function thumbFor(event) {
  if (event.thumbnailUrl) return event.thumbnailUrl;
  const match = event.images?.find(
    (img) => String(img._id) === String(event.thumbnailId),
  );
  return (match || event.images?.[0])?.url || "";
}

const SLOT_CLASSES = ["md:col-span-2 md:row-span-2", "", "", "md:col-span-2"];

function Tile({ event, className }) {
  return (
    <Link
      to="/gallery"
      className={`group relative rounded-2xl overflow-hidden block min-h-[220px] ${className}`}
    >
      <img
        src={resolveImageUrl(thumbFor(event))}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_180%_100%_at_bottom_left,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.5)_30%,rgba(0,0,0,0.15)_55%,transparent_75%)]" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-display text-white font-bold text-lg uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-slate-200/90 text-sm mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function SwastikExperience() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getGalleryEvents().then((data) => {
      const items = (data || [])
        .filter((e) => e.featuredOnHome)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .slice(0, 4);
      setFeatured(items);
    });
  }, []);

  if (featured.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-paper dark:bg-navy-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            THE SWASTIK{" "}
            <span className="text-[#D9383A] dark:text-[#3B82F6]">
              EXPERIENCE
            </span>
          </h2>
          <p className="text-slate-500 dark:text-navy-100/70 mt-3 text-sm sm:text-base">
            A college experience transcends beyond just classrooms and lecture
            theatres. Celebrate our fun-filled events throughout the academic
            year. Come and live the Swastik Experience!
          </p>
        </div>

        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-4">
          {featured.map((event, i) => (
            <Tile
              key={event._id || event.id}
              event={event}
              className={SLOT_CLASSES[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
