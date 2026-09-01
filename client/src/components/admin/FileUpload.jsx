import { useRef, useState } from "react";
import {
  UploadCloud,
  X,
  Loader2,
  FileText,
  FileImage,
  ExternalLink,
} from "lucide-react";
import { uploadImage, resolveImageUrl } from "../../api/client";

/**
 * Drag-and-drop (or click-to-browse) upload widget for a single document —
 * a PDF or an image. Unlike ImageUpload, this doesn't render an image
 * preview box; it shows a compact file chip instead, since the value may
 * well be a PDF.
 *
 * Props:
 *  - value: string (stored path, e.g. "/uploads/xyz.pdf" or a full URL)
 *  - onChange: (path: string) => void — called with the new stored path after
 *              upload, or '' when removed
 *  - label / hint: optional field chrome
 *  - accept: input accept attribute (default 'application/pdf,image/*')
 *  - allowWord: also accept .doc/.docx (used by Research/QAA uploads)
 */
const WORD_MIMETYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function FileUpload({
  value,
  onChange,
  label,
  hint,
  accept,
  allowWord = false,
}) {
  const resolvedAccept =
    accept ??
    (allowWord
      ? "application/pdf,image/*,.doc,.docx"
      : "application/pdf,image/*");
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function isAllowed(file) {
    if (!file) return false;
    if (file.type === "application/pdf" || file.type.startsWith("image/"))
      return true;
    return allowWord && WORD_MIMETYPES.includes(file.type);
  }

  async function handleFile(file) {
    if (!file) return;
    if (!isAllowed(file)) {
      setError(
        allowWord
          ? "Please choose a PDF, Word document, or image file"
          : "Please choose a PDF or image file",
      );
      return;
    }
    setError("");
    setUploading(true);
    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  const isDocument = value && /\.(pdf|docx?)($|\?)/i.test(value);
  const fileName = value ? value.split("/").pop() : "";

  return (
    <div>
      {label && (
        <span className="block text-sm font-medium text-navy-700 mb-1">
          {label}
        </span>
      )}

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/60 px-3 py-2.5">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-navy-100 text-navy-500">
            {isDocument ? <FileText size={18} /> : <FileImage size={18} />}
          </div>
          <a
            href={resolveImageUrl(value)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 text-sm text-navy-700 hover:text-marigold-600 truncate flex items-center gap-1"
            title={fileName}
          >
            <span className="truncate">{fileName}</span>
            <ExternalLink size={12} className="shrink-0 opacity-60" />
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="shrink-0 p-1.5 rounded-full text-navy-500 hover:bg-white hover:text-navy-700"
            title="Replace file"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="shrink-0 p-1.5 rounded-full text-red-500 hover:bg-white"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed transition-colors ${
            dragOver
              ? "border-marigold-400 bg-marigold-50"
              : "border-navy-200 bg-navy-50"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="w-full flex flex-col items-center justify-center gap-1.5 text-navy-400 hover:text-navy-600 py-6"
          >
            {uploading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <UploadCloud size={22} />
            )}
            <span className="text-xs font-medium px-2 text-center">
              {uploading
                ? "Uploading…"
                : allowWord
                  ? "Drag & drop a PDF, Word doc, or image here, or click to choose from your device"
                  : "Drag & drop a PDF or image here, or click to choose from your device"}
            </span>
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={resolvedAccept}
        className="hidden"
        onChange={handleInputChange}
      />
      {hint && !error && (
        <span className="block text-xs text-navy-400 mt-1">{hint}</span>
      )}
      {error && (
        <span className="block text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
}
