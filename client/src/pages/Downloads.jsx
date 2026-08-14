import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download as DownloadIcon,
  FileText,
  FolderDown,
} from "lucide-react";
import {
  getDownloads,
  resolveImageUrl,
  downloadFile,
  previewFile,
} from "../api/client";
import { Section } from "../components/Visibility";
import { PdfThumbnail } from "../components/PdfThumbnail";
import SEO from "../components/SEO";

const CATEGORIES = [
  "All",
  "Model Question",
  "Past Question",
  "Syllabus",
  "Notice",
  "Form",
  "General",
];

export default function Downloads() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [downloadingId, setDownloadingId] = useState(null);

  async function handleDownload(item) {
    setDownloadingId(item._id);
    try {
      await downloadFile(item.fileUrl, item.title);
    } catch (err) {
      console.error("Download failed:", err.message);
      // Fallback: open the file directly so the user can save it manually
      window.open(resolveImageUrl(item.fileUrl), "_blank", "noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  function handlePreview(item) {
    // Must fire synchronously on click (not awaited first) so the browser
    // doesn't treat the new tab as an unrequested popup.
    previewFile(item.fileUrl).catch((err) =>
      console.error("Preview failed:", err.message),
    );
  }

  useEffect(() => {
    getDownloads().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((d) => (category === "All" ? true : d.category === category))
      .filter((d) =>
        query.trim() === ""
          ? true
          : d.title.toLowerCase().includes(query.toLowerCase()),
      )
      .sort(
        (a, b) =>
          (a.order || 0) - (b.order || 0) ||
          new Date(b.createdAt) - new Date(a.createdAt),
      );
  }, [items, query, category]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <SEO
        title="Downloads — Model & Past Question Papers"
        description="Download model questions, past question papers, forms and other academic resources from Swastik College, Kathmandu."
        path="/downloads"
        keywords="Swastik College downloads, past question papers, model questions Nepal"
      />
      <Section page="downloads" section="hero">
        <div className="flex items-center gap-2 mb-2 text-[#D9383A] dark:text-[#3B82F6]">
          <FolderDown size={16} />
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
            Downloads
          </p>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy dark:text-paper mb-6">
          All Downloadable Files
        </h1>
      </Section>

      <Section page="downloads" section="list">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-300"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search downloads…"
              className="w-full pl-9 pr-4 py-2 rounded-full border border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs text-navy dark:text-paper placeholder:text-navy-300 focus:border-[#D9383A] dark:focus:border-[#1E3A8A] outline-none transition-colors"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  category === c
                    ? "bg-[#D9383A] text-white border-[#D9383A] dark:bg-[#1E3A8A] dark:text-white dark:border-[#1E3A8A]"
                    : "border-navy-100 dark:border-navy-700 text-navy-500 dark:text-navy-200 hover:border-[#D9383A] dark:hover:border-[#1E3A8A] hover:text-[#D9383A] dark:hover:text-[#3B82F6]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-navy-400 dark:text-navy-300 mb-3 font-mono">
          {filtered.length} file{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Compact Square Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((d) => {
            const fileUrl = resolveImageUrl(d.fileUrl);
            const isPdf = /\.pdf($|\?)/i.test(d.fileUrl || "");
            const isImage = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(
              d.fileUrl || "",
            );

            return (
              <div
                key={d._id}
                className="flex flex-col justify-between p-2.5 rounded-lg border border-transparent hover:border-b-[#D9383A] border-b-2 dark:hover:border-b-[#3B82F6] bg-white dark:bg-navy-800 shadow-xs hover:shadow-md transition-all group overflow-hidden"
              >
                {/* Large Preview Area — click to view/open in a new tab */}
                <button
                  type="button"
                  onClick={() => handlePreview(d)}
                  className="w-full h-32 flex items-center justify-center overflow-hidden rounded-md bg-navy-50/60 dark:bg-navy-900/60 mb-2 cursor-pointer"
                  title={`Preview ${d.title}`}
                >
                  {isPdf ? (
                    <PdfThumbnail url={fileUrl} />
                  ) : isImage ? (
                    <img
                      src={fileUrl}
                      alt={d.title}
                      className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-navy-300 dark:text-navy-600">
                      <FileText size={28} />
                      <span className="text-[9px] uppercase font-mono">
                        No Preview
                      </span>
                    </div>
                  )}
                </button>

                {/* Bottom Info & Download Button */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <h3
                    className="font-medium text-navy dark:text-paper text-xs truncate group-hover:text-[#D9383A] dark:group-hover:text-[#3B82F6] transition-colors"
                    title={d.title}
                  >
                    {d.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDownload(d)}
                    disabled={downloadingId === d._id}
                    className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-medium text-navy-600 dark:text-navy-100 border border-navy-100 dark:border-navy-700 py-1.5 rounded-md hover:bg-[#D9383A] hover:text-white dark:hover:bg-[#1E3A8A] dark:hover:text-white hover:border-transparent transition-colors disabled:opacity-60"
                  >
                    <DownloadIcon size={12} />
                    {downloadingId === d._id ? "Downloading…" : "Download"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-navy-400 dark:text-navy-300 py-16 text-sm">
            No downloads match your search.
          </p>
        )}
      </Section>
    </div>
  );
}
