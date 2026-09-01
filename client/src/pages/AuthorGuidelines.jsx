import { useEffect, useState } from "react";
import { FileText, FileImage, Download, BookMarked } from "lucide-react";
import {
  getAuthorGuidelines,
  resolveImageUrl,
  downloadFile,
} from "../api/client";
import { Section } from "../components/Visibility";
import SEO from "../components/SEO";

export default function AuthorGuidelines() {
  const [doc, setDoc] = useState({ content: "", files: [] });
  const [downloadingIdx, setDownloadingIdx] = useState(null);

  useEffect(() => {
    getAuthorGuidelines().then(setDoc);
  }, []);

  async function handleDownload(file, idx) {
    setDownloadingIdx(idx);
    try {
      await downloadFile(file.fileUrl, file.name);
    } catch (err) {
      console.error("Download failed:", err.message);
      window.open(resolveImageUrl(file.fileUrl), "_blank", "noreferrer");
    } finally {
      setDownloadingIdx(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <SEO
        title="Author Guidelines — Research"
        description="Submission guidelines for authors submitting research papers to Swastik College's journals and publications."
        path="/research/author-guidelines"
      />
      <Section page="research" section="authorGuidelines">
        <div className="flex items-center gap-2 mb-2 text-[#D9383A] dark:text-[#3B82F6]">
          <BookMarked size={16} />
          <p className="font-mono text-xs tracking-[0.2em] uppercase">
            Research
          </p>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium text-navy dark:text-paper mb-6">
          Author Guidelines
        </h1>

        {doc.content ? (
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        ) : (
          <p className="text-sm text-navy-400 dark:text-navy-300">
            Guidelines will be published here soon.
          </p>
        )}

        {(doc.files || []).length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg text-navy-800 dark:text-paper mb-3">
              Templates & Checklists
            </h2>
            <div className="space-y-2">
              {doc.files.map((f, i) => {
                const isPdf = /\.pdf($|\?)/i.test(f.fileUrl || "");
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDownload(f, i)}
                    disabled={downloadingIdx === i}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-navy-100 dark:border-navy-700 bg-white dark:bg-navy-800 hover:border-[#D9383A] dark:hover:border-[#3B82F6] transition-colors disabled:opacity-60"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-navy-50 dark:bg-navy-900 text-navy-500 dark:text-navy-300">
                        {isPdf ? <FileText size={18} /> : <FileImage size={18} />}
                      </span>
                      <span className="text-sm font-medium text-navy-800 dark:text-paper truncate">
                        {f.name || "Download"}
                      </span>
                    </span>
                    <Download
                      size={16}
                      className="shrink-0 text-navy-400 dark:text-navy-300"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
