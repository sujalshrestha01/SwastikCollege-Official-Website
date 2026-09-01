import { useEffect, useMemo, useState } from "react";
import { Download, GraduationCap } from "lucide-react";
import {
  getPublications,
  resolveImageUrl,
  downloadFile,
} from "../api/client";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

export default function Publications() {
  const [items, setItems] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    getPublications().then(setItems);
  }, []);

  async function handleDownload(item) {
    setDownloadingId(item._id);
    try {
      await downloadFile(item.fileUrl, item.title);
    } catch (err) {
      console.error("Download failed:", err.message);
      window.open(resolveImageUrl(item.fileUrl), "_blank", "noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          (a.order || 0) - (b.order || 0) ||
          new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [items],
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <SEO
        title="Publications"
        description="Faculty and institutional research publications from Swastik College."
        path="/publications"
      />
      <Section page="publications" section="hero">
        <div className="flex items-center gap-2 mb-2 text-[#D9383A] dark:text-[#3B82F6]">
          <GraduationCap size={16} />
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
            Research
          </p>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy dark:text-paper mb-6">
          Publications
        </h1>
      </Section>

      <Section page="publications" section="list">
        {sorted.length === 0 ? (
          <p className="text-sm text-navy-400 dark:text-navy-300">
            No publications listed yet.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((item) => (
              <div
                key={item._id}
                className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800"
              >
                <div className="min-w-0">
                  <span className="text-xs font-mono uppercase tracking-wide text-marigold-500">
                    {item.authors || "Unattributed"}
                    {item.publishedYear ? ` · ${item.publishedYear}` : ""}
                  </span>
                  <h3 className="font-display text-lg text-navy-800 dark:text-paper mt-0.5">
                    {item.title}
                  </h3>
                  {item.abstract && (
                    <p className="text-sm text-navy-500 dark:text-navy-300 mt-1.5">
                      {item.abstract}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  disabled={downloadingId === item._id}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-100 border border-navy-100 dark:border-navy-700 px-3 py-1.5 rounded-full hover:bg-[#D9383A] hover:text-white dark:hover:bg-[#1E3A8A] hover:border-transparent transition-colors disabled:opacity-60"
                >
                  <Download size={13} />
                  {downloadingId === item._id ? "…" : "Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
