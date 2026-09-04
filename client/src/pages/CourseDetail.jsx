import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ChevronDown, Download, CheckCircle2, ArrowLeft } from "lucide-react";
import { getCourse, resolveImageUrl } from "../api/client";
import SEO, { SITE_URL } from "../components/SEO";

function AccordionItem({ semester, isOpen, onToggle }) {
  return (
    <div className="border border-navy-100 dark:border-navy-700 rounded-xl overflow-hidden bg-white dark:bg-navy-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-navy dark:text-paper text-sm">
          {semester.title}
        </span>
        <ChevronDown
          size={17}
          className={`text-navy-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <ul className="px-5 pb-4 space-y-2">
          {(semester.subjects?.length
            ? semester.subjects
            : (semester.courses || []).map((name) => ({ name, code: "" }))
          ).map((c, index) => (
            <li
              key={`${c.name}-${index}`}
              className="flex items-center gap-2 text-sm text-navy-500 dark:text-navy-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-marigold-400 shrink-0" />

              <span>{c.name}</span>

              {c.code && (
                <span className="ml-auto font-mono text-xs text-navy-400 dark:text-navy-300">
                  {c.code}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    setCourse(null);
    getCourse(slug).then(setCourse);
  }, [slug]);

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center text-navy-400">
        Loading program…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SEO
        title={`${course.name} — ${course.tagline || "Program Details"}`}
        description={
          course.description ||
          `Details, eligibility, semester-wise curriculum and syllabus for ${course.name} at Swastik College, Kathmandu.`
        }
        path={`/programs/${slug}`}
        keywords={`${course.name}, ${course.tagline || ""}, Swastik College, Kathmandu`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.name,
          description: course.description,
          provider: {
            "@type": "CollegeOrUniversity",
            name: "Swastik College",
            sameAs: SITE_URL,
          },
        }}
      />
      <Link
        to="/programs"
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-marigold-600 mb-8"
      >
        <ArrowLeft size={15} /> All programs
      </Link>

      <p className="font-mono text-xs tracking-[0.2em] text-teal-600 dark:text-teal-400 uppercase mb-2">
        {course.duration}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-medium text-navy dark:text-paper mb-2">
        {course.name}
      </h1>
      <p className="text-navy-500 dark:text-navy-200 font-medium">
        {course.tagline}
      </p>
      <p className="text-navy-400 dark:text-navy-300 mt-4 max-w-2xl leading-relaxed">
        {course.description}
      </p>

      <a
        href={resolveImageUrl(course.syllabusUrl)}
        target="_blank"
        rel="noreferrer"
        download
        className="inline-flex items-center gap-2 bg-navy hover:bg-navy-600 text-paper font-medium text-sm px-5 py-2.5 rounded-full mt-6 transition-colors"
      >
        <Download size={16} /> Download Full Syllabus (PDF)
      </a>

      <div className="grid sm:grid-cols-2 gap-10 mt-12">
        <div>
          <h2 className="font-display text-xl font-medium text-navy dark:text-paper mb-4">
            Admission Eligibility
          </h2>
          <ul className="space-y-3">
            {course.eligibility.map((e) => (
              <li
                key={e}
                className="flex items-start gap-2.5 text-sm text-navy-500 dark:text-navy-200"
              >
                <CheckCircle2
                  size={16}
                  className="text-teal-500 shrink-0 mt-0.5"
                />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-medium text-navy dark:text-paper mb-4">
            Semester Breakdown
          </h2>
          <div className="space-y-2.5">
            {course.semesters.map((s, i) => (
              <AccordionItem
                key={s.title}
                semester={s}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
