import { useEffect, useState } from "react";
import { getPlacementPartners, resolveImageUrl } from "../api/client";

// Above this many partners, a left-title/right-logos row gets cramped —
// switch to a centered heading with a logo grid below instead.
const SIDE_BY_SIDE_LIMIT = 3;

export default function PlacementPartners() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    getPlacementPartners().then(setPartners);
  }, []);

  // Nothing added in Admin → Placement Partners yet — hide quietly rather
  // than showing an empty section.
  if (partners.length === 0) return null;

  const compact = partners.length <= SIDE_BY_SIDE_LIMIT;

  const titleBlock = (
    <>
      <h2 className="text-2xl sm:text-3xl font-serif text-slate-800 dark:text-white tracking-tight font-medium">
        Our{" "}
        <span className="text-[#D9383A] dark:text-[#3B82F6] font-bold">
          Placement Partners
        </span>
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-navy-100 mt-2 font-sans leading-relaxed">
        Collaborating with industry leaders to provide direct career
        pathways for our graduates.
      </p>
    </>
  );

  const renderCard = (partner) => {
    const card = (
      <div className="w-40 sm:w-44 h-24 sm:h-28 bg-white/90 hover:bg-white dark:bg-white/95 dark:hover:bg-white border border-slate-200/80 dark:border-navy-700/80 rounded-2xl p-4 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center">
        <img
          src={resolveImageUrl(partner.logoUrl)}
          alt={partner.name}
          className="max-h-12 sm:max-h-16 max-w-full w-auto object-contain block mx-auto shrink-0"
        />
      </div>
    );

    return partner.websiteUrl ? (
      <a
        key={partner._id}
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center"
      >
        {card}
      </a>
    ) : (
      <div key={partner._id} className="flex items-center justify-center">
        {card}
      </div>
    );
  };

  return (
    <section className="w-full bg-slate-100/90 border-y dark:border-gray-700 dark:bg-navy-900/90 py-12 sm:py-20 px-4 sm:px-8 transition-colors duration-300">
      {compact ? (
        // Few partners: title on the left, logos on the right — stacks on
        // mobile, side-by-side from lg up.
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left shrink-0 max-w-sm">
            {titleBlock}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {partners.map(renderCard)}
          </div>
        </div>
      ) : (
        // More partners: centered heading up top, uniform grid below — a
        // side-by-side row would get cramped past a handful of logos.
        <div className="max-w-5xl mx-auto text-center">
          <div className="max-w-md mx-auto">
            {titleBlock}
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 items-center justify-items-center max-w-3xl mx-auto">
            {partners.map(renderCard)}
          </div>
        </div>
      )}
    </section>
  );
}