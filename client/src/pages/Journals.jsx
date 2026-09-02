import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  BookOpen,
} from "lucide-react";
import {
  getJournals,
  resolveImageUrl,
  downloadFile,
  previewFile,
} from "../api/client";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

const PAGE_SIZE = 10;

export default function Journals() {
  const [items, setItems] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getJournals().then(setItems);
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

  function handlePreview(item) {
    previewFile(item.fileUrl).catch((err) =>
      console.error("Preview failed:", err.message),
    );
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

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <SEO
        title="Journals — Research"
        description="Published journal issues from Swastik College's research programs."
        path="/research/journals"
      />
      <Section page="research" section="journals">
        <div className="flex items-center gap-2 mb-2 text-[#D9383A] dark:text-[#3B82F6]">
          <BookOpen size={16} />
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
            Research
          </p>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy dark:text-paper mb-6">
          Journals
        </h1>

        {sorted.length === 0 ? (
          <p className="text-sm text-navy-400 dark:text-navy-300">
            No journal issues published yet.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {pageItems.map((item) => {
                const journalLabel = item.journalName || item.issueNumber || "";
                const yearLabel = item.publishedYear
                  ? `(${item.publishedYear})`
                  : "";

                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-navy-50/60 dark:bg-navy-800/60 border border-transparent hover:border-navy-100 dark:hover:border-navy-700 transition-colors"
                  >
                    {/* Left: journal name + year */}
                    <div className="sm:w-48 shrink-0">
                      <p className="text-xs sm:text-sm text-navy-500 dark:text-navy-300 leading-snug">
                        {journalLabel}
                        {yearLabel && (
                          <>
                            {journalLabel ? " " : ""}
                            {yearLabel}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Dotted vertical divider (desktop only) */}
                    <div className="hidden sm:block w-px border-l-2 border-dotted border-navy-200 dark:border-navy-600" />

                    {/* Right: authors + title + actions */}
                    <div className="flex-1 min-w-0">
                      {item.authors && (
                        <p className="flex items-start gap-2 text-sm text-navy-600 dark:text-navy-200 mb-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D9383A] dark:bg-[#3B82F6] shrink-0" />
                          <span>{item.authors}</span>
                        </p>
                      )}
                      <h3 className="font-display text-base sm:text-lg font-semibold text-navy-800 dark:text-paper leading-snug mb-4">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreview(item)}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-100 border border-navy-200 dark:border-navy-600 px-3 py-1.5 rounded-full hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
                        >
                          <Eye size={13} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item._id}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-100 border border-navy-200 dark:border-navy-600 px-3 py-1.5 rounded-full hover:bg-[#D9383A] hover:text-white dark:hover:bg-[#1E3A8A] hover:border-transparent transition-colors disabled:opacity-60"
                        >
                          <Download size={13} />
                          {downloadingId === item._id
                            ? "Downloading…"
                            : "Download"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 text-sm font-medium text-navy-600 dark:text-navy-100 border border-navy-200 dark:border-navy-600 px-4 py-2 rounded-full hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <span className="text-xs font-mono text-navy-400 dark:text-navy-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 text-sm font-medium text-navy-600 dark:text-navy-100 border border-navy-200 dark:border-navy-600 px-4 py-2 rounded-full hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
