import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Eye,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getNotices,
  resolveImageUrl,
  downloadFile,
  previewFile,
} from "../api/client";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

const CATEGORIES = ["All", "Exams", "Admissions", "Events", "General"];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [downloadingId, setDownloadingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const noticesPerPage = 5;

  async function handleDownload(notice) {
    setDownloadingId(notice._id);
    try {
      await downloadFile(notice.fileUrl, notice.title);
    } catch (err) {
      console.error("Download failed:", err.message);
      window.open(resolveImageUrl(notice.fileUrl), "_blank", "noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  function handlePreview(notice) {
    // Must fire synchronously on click (not awaited first) so the browser
    // doesn't treat the new tab as an unrequested popup.
    previewFile(notice.fileUrl).catch((err) =>
      console.error("Preview failed:", err.message),
    );
  }

  useEffect(() => {
    getNotices().then(setNotices);
  }, []);

  const filtered = useMemo(() => {
    return notices
      .filter((n) => (category === "All" ? true : n.category === category))
      .filter((n) =>
        query.trim() === ""
          ? true
          : (n.title + " " + n.excerpt)
              .toLowerCase()
              .includes(query.toLowerCase()),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [notices, query, category]);

  // Reset to first page when searching/filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [query, category]);

  const totalPages = Math.ceil(filtered.length / noticesPerPage);

  const currentNotices = filtered.slice(
    (currentPage - 1) * noticesPerPage,
    currentPage * noticesPerPage,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SEO
        title="Notice Board"
        description="Latest exam routines, admission notices, events and announcements from Swastik College, Kathmandu."
        path="/notices"
        keywords="Swastik College notices, Swastik College exam routine, Swastik College admission notice"
      />
      <Section page="notices" section="hero">
        <div className="flex items-center gap-2 mb-2 text-[#D9383A] dark:text-[#3B82F6]">
          <Bell size={16} />
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
            Notice Board
          </p>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-medium text-navy dark:text-paper mb-6">
          All Notices
        </h1>
      </Section>

      <Section page="notices" section="list">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search notices..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800 text-sm text-navy dark:text-paper placeholder:text-navy-300 focus:border-[#D9383A] dark:focus:border-[#1E3A8A] outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  category === c
                    ? "bg-[#D9383A] text-white border-[#D9383A] dark:bg-[#1E3A8A] dark:border-[#1E3A8A]"
                    : "border-navy-100 dark:border-navy-700 text-navy-500 dark:text-navy-200 hover:border-[#D9383A] dark:hover:border-[#1E3A8A] hover:text-[#D9383A] dark:hover:text-[#3B82F6]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-navy-400 dark:text-navy-300 mb-4 font-mono">
          {filtered.length} notice{filtered.length !== 1 ? "s" : ""} found
        </p>

        <div className="space-y-3">
          {currentNotices.map((n) => (
            <div
              key={n._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-r-xl rounded-l-lg hover:border-l-4 hover:border-l-[#D9383A] hover:dark:border-l-[#1E3A8A] hover:border-t-0 hover:border-r-0 hover:border-b-0 p-5 bg-white dark:bg-navy-800 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[11px] font-mono uppercase tracking-wide text-[#D9383A] dark:text-[#3B82F6] bg-red-50 dark:bg-navy-700/60 px-2 py-0.5 rounded-full">
                    {n.category}
                  </span>

                  <span className="text-xs text-navy-400 dark:text-navy-300 font-mono">
                    {formatDate(n.date)}
                  </span>
                </div>

                <h3 className="font-medium text-navy dark:text-paper text-sm group-hover:text-[#D9383A] dark:group-hover:text-[#3B82F6] transition-colors">
                  {n.fileUrl ? (
                    <button
                      type="button"
                      onClick={() => handlePreview(n)}
                      className="hover:underline text-left"
                      title={`Preview ${n.title}`}
                    >
                      {n.title}
                    </button>
                  ) : (
                    n.title
                  )}
                </h3>

                <p className="text-xs text-navy-400 dark:text-navy-300 mt-1.5">
                  {n.excerpt}
                </p>
              </div>

              {n.fileUrl && (
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreview(n)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-100 border border-navy-100 dark:border-navy-700 px-3.5 py-2 rounded-full hover:border-[#D9383A] dark:hover:border-[#1E3A8A] hover:text-[#D9383A] dark:hover:text-[#3B82F6] transition-colors"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(n)}
                    disabled={downloadingId === n._id}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-100 border border-navy-100 dark:border-navy-700 px-3.5 py-2 rounded-full hover:border-[#D9383A] dark:hover:border-[#1E3A8A] hover:text-[#D9383A] dark:hover:text-[#3B82F6] transition-colors disabled:opacity-60"
                  >
                    <Download size={14} />
                    {downloadingId === n._id ? "Downloading…" : "Download"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {currentNotices.length === 0 && (
            <p className="text-center text-navy-400 dark:text-navy-300 py-16 text-sm">
              No notices match your search.
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-navy-200 dark:border-navy-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#D9383A] dark:hover:border-[#1E3A8A]"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg border text-sm transition-colors ${
                    currentPage === page
                      ? "bg-[#D9383A] text-white border-[#D9383A] dark:bg-[#1E3A8A] dark:border-[#1E3A8A]"
                      : "border-navy-200 dark:border-navy-700 text-navy dark:text-paper hover:border-[#D9383A] dark:hover:border-[#1E3A8A]"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-navy-200 dark:border-navy-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#D9383A] dark:hover:border-[#1E3A8A]"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Section>
    </div>
  );
}
