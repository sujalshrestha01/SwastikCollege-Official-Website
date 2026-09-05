import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { getCourse, resolveImageUrl } from "../api/client";
import SEO from "../components/SEO";

function createSlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SemesterSyllabus() {
  const { slug, semesterSlug } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      try {
        setLoading(true);
        setError("");

        const data = await getCourse(slug);

        if (mounted) {
          setCourse(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load course.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-navy-400">Loading syllabus…</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-navy-500 dark:text-navy-200 mb-5">
          {error || "Course not found."}
        </p>

        <Link
          to="/programs"
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-marigold-600"
        >
          <ArrowLeft size={15} />
          Back to programs
        </Link>
      </div>
    );
  }

  const semesters = course.semesters || [];

  const semester = semesters.find(
    (item) => createSlug(item.title) === semesterSlug
  );

  if (!semester) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-navy-500 dark:text-navy-200 mb-5">
          Semester not found.
        </p>

        <Link
          to={`/programs/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-marigold-600"
        >
          <ArrowLeft size={15} />
          Back to {course.name}
        </Link>
      </div>
    );
  }

  const subjects = semester.subjects?.length
    ? semester.subjects
    : (semester.courses || []).map((name) => ({
        name,
        code: "",
      }));

  const electives = semester.electives || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SEO
        title={`${semester.title} — ${course.name}`}
        description={`View the subjects, electives, and complete syllabus for ${semester.title} of ${course.name} at Swastik College.`}
        path={`/programs/${slug}/semester/${semesterSlug}`}
        keywords={`${course.name}, ${semester.title}, syllabus, subjects, Swastik College`}
      />

      {/* Back to course */}
      <Link
        to={`/programs/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-marigold-600 mb-8"
      >
        <ArrowLeft size={15} />
        Back to {course.name}
      </Link>

      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] text-teal-600 dark:text-teal-400 uppercase mb-2">
        {course.name}
      </p>

      <h1 className="font-display text-3xl sm:text-4xl font-medium text-navy dark:text-paper mb-3">
        {semester.title}
      </h1>

      <p className="text-navy-500 dark:text-navy-200">
        Semester-wise curriculum and complete syllabus
      </p>

      {/* Core Subjects */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-medium text-navy dark:text-paper mb-4">
          Core Subjects
        </h2>

        {subjects.length > 0 ? (
          <div className="border border-navy-100 dark:border-navy-700 rounded-xl overflow-hidden bg-white dark:bg-navy-800">
            {subjects.map((subject, index) => (
              <div
                key={`${subject.name || "subject"}-${index}`}
                className="flex items-center gap-3 px-5 py-4 border-b last:border-b-0 border-navy-100 dark:border-navy-700"
              >
                <CheckCircle2
                  size={17}
                  className="text-teal-500 shrink-0"
                />

                <span className="text-sm text-navy-600 dark:text-navy-200">
                  {subject.name}
                </span>

                {subject.code && (
                  <span className="ml-auto font-mono text-xs text-navy-400 dark:text-navy-300">
                    {subject.code}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-400">
            No core subjects listed for this semester.
          </p>
        )}
      </section>

      {/* Electives */}
      {electives.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-medium text-navy dark:text-paper mb-4">
            Available Electives
          </h2>

          <div className="border border-navy-100 dark:border-navy-700 rounded-xl overflow-hidden bg-white dark:bg-navy-800">
            {electives.map((elective, index) => (
              <div
                key={`${elective.name || "elective"}-${index}`}
                className="flex items-center gap-3 px-5 py-4 border-b last:border-b-0 border-navy-100 dark:border-navy-700"
              >
                <CheckCircle2
                  size={17}
                  className="text-teal-500 shrink-0"
                />

                <span className="text-sm text-navy-600 dark:text-navy-200">
                  {elective.name}
                </span>

                {elective.code && (
                  <span className="ml-auto font-mono text-xs text-navy-400 dark:text-navy-300">
                    {elective.code}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full Semester Syllabus PDF */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-medium text-navy dark:text-paper mb-4">
          Full Semester Syllabus
        </h2>

        {semester.syllabusUrl ? (
          <div className="border border-navy-100 dark:border-navy-700 rounded-xl p-5 bg-white dark:bg-navy-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-navy-50 dark:bg-navy-700 flex items-center justify-center">
                  <FileText
                    size={21}
                    className="text-teal-600 dark:text-teal-400"
                  />
                </div>

                <div>
                  <p className="font-medium text-navy dark:text-paper">
                    {semester.title} Syllabus
                  </p>

                  <p className="text-xs text-navy-400 mt-1">
                    Complete syllabus document
                  </p>
                </div>
              </div>

              <a
                href={resolveImageUrl(semester.syllabusUrl)}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-600 text-paper font-medium text-sm px-5 py-2.5 rounded-full transition-colors"
              >
                <Download size={16} />
                View / Download PDF
              </a>
            </div>
          </div>
        ) : (
          <div className="border border-navy-100 dark:border-navy-700 rounded-xl p-5 bg-white dark:bg-navy-800">
            <p className="text-sm text-navy-400">
              The full syllabus PDF for this semester is not available yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

