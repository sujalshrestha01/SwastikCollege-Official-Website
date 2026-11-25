import { useEffect, useState } from "react";
import { Award, Eye, FileText } from "lucide-react";
import { getScholarships, previewFile } from "../api/client";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Scholarships() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScholarships()
      .then(setLists)
      .finally(() => setLoading(false));
  }, []);

  function handlePreview(item) {
    // Fire synchronously on click so the new tab isn't treated as a popup.
    previewFile(item.fileUrl).catch((err) =>
      console.error("Preview failed:", err.message),
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SEO
        title="Scholarships"
        description="Scholarship recipients at Swastik College, published as per Tribhuvan University scholarship procedures."
        path="/scholarships"
        keywords="Swastik College scholarship, BCA scholarship, TU BCA scholarship recipients"
      />
      <Section page="scholarships" section="hero">
        <div className="flex items-center gap-2 mb-2 text-[#D9383A] dark:text-[#3B82F6]">
          <Award size={16} />
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
            Scholarships
          </p>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-navy dark:text-paper mb-3">
          Scholarship Recipients
        </h1>
        <p className="text-sm text-navy-500 dark:text-navy-300 mb-10 max-w-2xl">
          Students awarded scholarships at Swastik College, published in
          accordance with the directives of Tribhuvan University.
        </p>
      </Section>

      <Section page="scholarships" section="list">
        {loading ? (
          <p className="text-sm text-navy-400 dark:text-navy-300">Loading…</p>
        ) : lists.length === 0 ? (
          <p className="text-center text-navy-400 dark:text-navy-300 py-16 text-sm">
            No scholarship lists have been published yet.
          </p>
        ) : (
          <div className="space-y-10">
            {lists.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl bg-white dark:bg-navy-800 shadow-xs border border-navy-100 dark:border-navy-700 p-5 sm:p-7"
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {[item.program, item.batch && `${item.batch} Batch`]
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono uppercase tracking-wide text-[#D9383A] dark:text-[#3B82F6] bg-red-50 dark:bg-navy-700/60 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  {item.date && (
                    <span className="text-xs text-navy-400 dark:text-navy-300 font-mono">
                      {formatDate(item.date)}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-xl sm:text-2xl text-navy dark:text-paper">
                  {item.title}
                </h2>

                {item.description && (
                  <p className="text-sm leading-relaxed text-navy-600 dark:text-navy-200 mt-4 whitespace-pre-line">
                    {item.description}
                  </p>
                )}

                {item.students?.length > 0 && (
                  <div className="mt-6 overflow-x-auto rounded-xl border border-navy-100 dark:border-navy-700">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-navy-50 dark:bg-navy-700/60 text-navy-600 dark:text-navy-100">
                        <tr>
                          <th className="px-4 py-3 font-medium w-16">S.N.</th>
                          <th className="px-4 py-3 font-medium">
                            Name of the Student
                          </th>
                          <th className="px-4 py-3 font-medium">
                            Entrance Roll No.
                          </th>
                          <th className="px-4 py-3 font-medium">Gender</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100 dark:divide-navy-700 text-navy dark:text-paper">
                        {item.students.map((s, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-mono text-navy-400 dark:text-navy-300">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 font-medium">{s.name}</td>
                            <td className="px-4 py-3 font-mono">
                              {s.rollNo || "—"}
                            </td>
                            <td className="px-4 py-3">{s.gender || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {item.fileUrl && (
                  <button
                    type="button"
                    onClick={() => handlePreview(item)}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-100 border border-navy-100 dark:border-navy-700 px-3.5 py-2 rounded-full hover:border-[#D9383A] dark:hover:border-[#1E3A8A] hover:text-[#D9383A] dark:hover:text-[#3B82F6] transition-colors"
                  >
                    <FileText size={14} />
                    View original TU notice
                    <Eye size={14} />
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
