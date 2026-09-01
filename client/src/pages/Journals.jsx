import { useEffect, useMemo, useState } from "react";
import { Download, BookOpen } from "lucide-react";
import {
  getJournals,
  resolveImageUrl,
  downloadFile,
  previewFile,
} from "../api/client";
import { PdfThumbnail } from "../components/PdfThumbnail";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

export default function Journals() {
  const [items, setItems] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sorted.map((item) => {
              const fileUrl = resolveImageUrl(item.fileUrl);
              const isPdf = /\.pdf($|\?)/i.test(item.fileUrl || "");
              const coverUrl = item.coverImageUrl
                ? resolveImageUrl(item.coverImageUrl)
                : null;

              return (
                <div
                  key={item._id}
                  className="flex flex-col p-3 rounded-xl border border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800 hover:shadow-md transition-shadow"
                >
                  <button
                    type="button"
                    onClick={() => handlePreview(item)}
                    className="w-full h-40 flex items-center justify-center overflow-hidden rounded-md bg-navy-50/60 dark:bg-navy-900/60 mb-3 cursor-pointer"
                    title={`Preview ${item.title}`}
                  >
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : isPdf ? (
                      <PdfThumbnail url={fileUrl} />
                    ) : (
                      <BookOpen size={28} className="text-navy-300" />
                    )}
                  </button>
                  <span className="text-[11px] font-mono uppercase tracking-wide text-marigold-500">
                    {item.issueNumber || item.publishedYear}
                  </span>
                  <h3 className="font-display text-sm text-navy-800 dark:text-paper mt-0.5 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item._id}
                    className="mt-auto inline-flex items-center justify-center gap-1 text-[11px] font-medium text-navy-600 dark:text-navy-100 border border-navy-100 dark:border-navy-700 py-1.5 rounded-md hover:bg-[#D9383A] hover:text-white dark:hover:bg-[#1E3A8A] hover:border-transparent transition-colors disabled:opacity-60"
                  >
                    <Download size={12} />
                    {downloadingId === item._id ? "Downloading…" : "Download"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
