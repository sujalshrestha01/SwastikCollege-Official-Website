import { useEffect, useMemo, useState } from "react";
import { FileText, Download, Megaphone } from "lucide-react";
import { getCallForPapers, resolveImageUrl, downloadFile } from "../api/client";
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

export default function CallForPaper() {
  const [items, setItems] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    getCallForPapers().then(setItems);
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
        title="Call for Paper — Research"
        description="Current calls for paper for Swastik College's academic journals and publications."
        path="/research/call-for-paper"
      />
      <Section page="research" section="callForPapers">
        <div className="flex items-center gap-2 mb-2 text-[#D9383A] dark:text-[#3B82F6]">
          <Megaphone size={16} />
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
            Research
          </p>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy dark:text-paper mb-6">
          Call For Paper
        </h1>

        {sorted.length === 0 ? (
          <p className="text-sm text-navy-400 dark:text-navy-300">
            No open calls for paper right now — check back soon.
          </p>
        ) : (
          <div className="space-y-4">
            {sorted.map((item) => (
              <div
                key={item._id}
                className="p-4 sm:p-5 rounded-2xl border border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.status === "open"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-navy-100 text-navy-600 dark:bg-navy-700 dark:text-navy-300"
                      }`}
                    >
                      {item.status === "open" ? "Open" : "Closed"}
                    </span>
                    {item.deadline && (
                      <span className="ml-2 text-xs text-navy-400 dark:text-navy-400">
                        Deadline: {formatDate(item.deadline)}
                      </span>
                    )}
                    <h3 className="font-display text-lg text-navy-800 dark:text-paper mt-1">
                      {item.title}
                    </h3>
                  </div>
                  {item.fileUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      disabled={downloadingId === item._id}
                      className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-100 border border-navy-100 dark:border-navy-700 px-3 py-1.5 rounded-full hover:bg-[#D9383A] hover:text-white dark:hover:bg-[#1E3A8A] hover:border-transparent transition-colors disabled:opacity-60"
                    >
                      <Download size={13} />
                      {downloadingId === item._id ? "Downloading…" : "Notice"}
                    </button>
                  )}
                </div>
                {item.description && (
                  <div
                    className="blog-content mt-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
