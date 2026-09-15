import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  File as FileIcon,
  FileImage,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  qaaAdmin,
  verifyQaaDocument,
  previewFile,
  downloadFile,
  resolveImageUrl,
  getPdfThumbnailUrl,
} from "../../api/client";
import {
  Banner,
  Button,
  Card,
  Field,
  IconButton,
  Input,
  Select,
  Textarea,
} from "../../components/admin/Ui";
import FileUpload from "../../components/admin/FileUpload";
import { useAuth } from "../../context/AuthContext";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const LAYOUT_KEY = "swastik_qaa_layout";

const empty = () => ({
  title: "",
  description: "",
  fileUrl: "",
  fileName: "",
  fileSize: 0,
  fileType: "pdf",
});

// The stored URL is the only reliable signal of what was uploaded — the
// server rewrites filenames, so the extension on the URL is what's left.
function fileTypeFromUrl(url = "") {
  if (/\.docx($|\?)/i.test(url)) return "docx";
  if (/\.doc($|\?)/i.test(url)) return "doc";
  if (/\.pdf($|\?)/i.test(url)) return "pdf";
  if (/\.(png|jpe?g|gif|webp|avif|heic|heif|bmp|tiff?)($|\?)/i.test(url))
    return "image";
  return "other";
}

function extFromUrl(url = "") {
  const match = /\.([a-z0-9]{1,5})($|\?)/i.exec(url);
  return match ? match[1].toLowerCase() : "";
}

const TYPE_LABELS = {
  pdf: "PDF document",
  doc: "Word document",
  docx: "Word document",
  image: "Scanned image",
  other: "Document",
};

function formatBytes(bytes) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded =
    unit === 0 || value >= 10 ? Math.round(value) : value.toFixed(1);
  return `${rounded} ${units[unit]}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Storage URLs end in a random id, so a plain browser download would save
// "a3f9c1.pdf". Fall back to the document's own title when the original
// filename wasn't recorded (documents uploaded before that field existed).
function downloadNameFor(doc) {
  if (doc.fileName) return doc.fileName;
  const ext = extFromUrl(doc.fileUrl);
  const base = (doc.title || "document").replace(/[\\/:*?"<>|]+/g, "-").trim();
  return ext ? `${base}.${ext}` : base;
}

const SORTS = {
  newest: { label: "Newest first", compare: (a, b) => dateOf(b) - dateOf(a) },
  oldest: { label: "Oldest first", compare: (a, b) => dateOf(a) - dateOf(b) },
  title: {
    label: "Title A–Z",
    compare: (a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""), undefined, {
        numeric: true,
        sensitivity: "base",
      }),
  },
  pending: {
    label: "Awaiting review first",
    compare: (a, b) =>
      Number(a.status === "verified") - Number(b.status === "verified") ||
      dateOf(b) - dateOf(a),
  },
  largest: {
    label: "Largest file",
    compare: (a, b) => (b.fileSize || 0) - (a.fileSize || 0),
  },
};

function dateOf(doc) {
  return new Date(doc.updatedAt || doc.createdAt || 0).getTime();
}

function StatusPill({ verified }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
        verified
          ? "bg-green-50 text-green-700"
          : "bg-marigold-50 text-marigold-600"
      }`}
    >
      {verified ? "Verified" : "Pending"}
    </span>
  );
}

function FileGlyph({ type, size = 18 }) {
  if (type === "image") return <FileImage size={size} />;
  if (type === "other") return <FileIcon size={size} />;
  return <FileText size={size} />;
}

// Both action groups live at module scope rather than inside the page
// component. Declared inside, they'd be a new component type on every render,
// so React would tear down and rebuild the buttons each time `busy` changed —
// which is exactly when one of them has focus.
function ViewDownload({ doc, busy, onView, onDownload }) {
  const viewing = busy === `${doc._id}:view`;
  const downloading = busy === `${doc._id}:download`;
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onView(doc)}
        disabled={viewing}
        title="Open in a new tab"
      >
        {viewing ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Eye size={14} />
        )}
        <span className="hidden md:inline">View</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDownload(doc)}
        disabled={downloading}
        title="Save a copy"
      >
        {downloading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        <span className="hidden md:inline">Download</span>
      </Button>
    </>
  );
}

function ManageActions({ doc, busy, canEdit, onVerify, onEdit, onDelete }) {
  const verified = doc.status === "verified";
  const rowBusy = busy.startsWith(`${doc._id}:`);
  return (
    <>
      <IconButton
        size="sm"
        variant={verified ? "outline" : "success"}
        onClick={() => onVerify(doc)}
        disabled={rowBusy}
        title={verified ? "Mark as pending" : "Mark as verified"}
        aria-label={
          verified
            ? `Mark ${doc.title} as pending`
            : `Mark ${doc.title} as verified`
        }
      >
        {verified ? <ShieldAlert size={15} /> : <ShieldCheck size={15} />}
      </IconButton>
      {canEdit && (
        <>
          <IconButton
            size="sm"
            title="Edit details"
            aria-label={`Edit ${doc.title}`}
            onClick={() => onEdit(doc)}
          >
            <Pencil size={15} />
          </IconButton>
          <IconButton
            size="sm"
            variant="danger"
            title="Delete document"
            aria-label={`Delete ${doc.title}`}
            disabled={rowBusy}
            onClick={() => onDelete(doc)}
          >
            <Trash2 size={15} />
          </IconButton>
        </>
      )}
    </>
  );
}

function verificationLine(doc) {
  if (doc.status === "verified" && doc.verifiedBy) {
    return `Verified by ${doc.verifiedBy}${
      doc.verifiedAt ? ` on ${formatDate(doc.verifiedAt)}` : ""
    }`;
  }
  return null;
}

// Card layout shows a real preview where one is available: page 1 of a
// Cloudinary-hosted PDF, or the image itself for a scan. Anything else (Word
// files, non-Cloudinary uploads) falls back to the type icon, as does a
// preview that fails to load.
function Thumbnail({ doc, type }) {
  const [failed, setFailed] = useState(false);
  const src =
    type === "image"
      ? resolveImageUrl(doc.fileUrl)
      : type === "pdf"
        ? getPdfThumbnailUrl(doc.fileUrl)
        : null;

  if (!src || failed) {
    return (
      <div className="grid place-items-center h-full bg-navy-50 text-navy-300">
        <FileGlyph type={type} size={32} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover object-top"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminQaa() {
  const { admin } = useAuth();
  const isVerifierOnly = admin?.role === "qaaVerifier";
  const canEdit = !isVerifierOnly;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [layout, setLayout] = useState("list"); // "list" | "cards"
  const [busy, setBusy] = useState(""); // "<id>:<action>" of the action in flight

  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Remember the chosen layout between visits — it's a personal preference,
  // and re-picking it every time you open the page gets old fast.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAYOUT_KEY);
      if (stored === "list" || stored === "cards") setLayout(stored);
    } catch {
      // Private browsing / storage disabled — the default is fine.
    }
  }, []);

  function changeLayout(next) {
    setLayout(next);
    try {
      localStorage.setItem(LAYOUT_KEY, next);
    } catch {
      // Not being able to remember the preference shouldn't break the switch.
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await qaaAdmin.list());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = (text) =>
      String(text || "")
        .toLowerCase()
        .includes(needle);
    return items
      .filter((doc) => {
        if (statusFilter === "verified" && doc.status !== "verified")
          return false;
        if (statusFilter === "pending" && doc.status === "verified")
          return false;
        if (!needle) return true;
        return (
          matches(doc.title) ||
          matches(doc.description) ||
          matches(doc.fileName) ||
          matches(doc.verifiedBy)
        );
      })
      .sort(SORTS[sortKey]?.compare || SORTS.newest.compare);
  }, [items, query, statusFilter, sortKey]);

  const verifiedCount = items.filter((d) => d.status === "verified").length;
  const filtering = query.trim().length > 0 || statusFilter !== "all";

  /* ---------------- actions ---------------- */

  async function handleSave() {
    if (!editing.title.trim()) {
      setError("Add a title before saving");
      return;
    }
    if (!editing.fileUrl) {
      setError("Upload the document before saving");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...editing,
        fileType: fileTypeFromUrl(editing.fileUrl),
      };
      if (isNew) await qaaAdmin.create(payload);
      else await qaaAdmin.update(editing._id, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(doc) {
    if (
      !confirm(
        `Delete "${doc.title}"? The uploaded file is removed too and this can't be undone.`,
      )
    )
      return;
    setBusy(`${doc._id}:delete`);
    try {
      await qaaAdmin.remove(doc._id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function toggleVerify(doc) {
    setBusy(`${doc._id}:verify`);
    setError("");
    try {
      await verifyQaaDocument(
        doc._id,
        doc.status === "verified" ? "pending" : "verified",
      );
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function handleView(doc) {
    setBusy(`${doc._id}:view`);
    setError("");
    try {
      await previewFile(doc.fileUrl);
    } catch {
      setError(
        `"${doc.title}" couldn't be opened. Try downloading it instead.`,
      );
    } finally {
      setBusy("");
    }
  }

  async function handleDownload(doc) {
    setBusy(`${doc._id}:download`);
    setError("");
    try {
      await downloadFile(doc.fileUrl, downloadNameFor(doc));
    } catch {
      setError(`"${doc.title}" couldn't be downloaded. Check your connection.`);
    } finally {
      setBusy("");
    }
  }

  /* ---------------- edit form ---------------- */

  if (editing) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "Upload QAA document" : "Edit QAA document"}
          </h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              <X size={16} /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? "Saving…" : "Save document"}
            </Button>
          </div>
        </div>
        {error && <Banner type="error">{error}</Banner>}
        <Card>
          <div className="space-y-4">
            <Field label="Title">
              <Input
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                placeholder="Self-Study Report 2026"
              />
            </Field>
            <Field label="Description (optional)">
              <Textarea
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                placeholder="What this document covers, and which criterion it supports"
              />
            </Field>
            <Field
              label="File"
              hint="PDF, Word document, or a scan of a signed original"
            >
              <FileUpload
                value={editing.fileUrl}
                onChange={(url, meta) =>
                  setEditing({
                    ...editing,
                    fileUrl: url,
                    fileName: meta?.fileName || "",
                    fileSize: meta?.size || 0,
                  })
                }
                allowWord
              />
            </Field>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------------- browser view ---------------- */

  function startEdit(doc) {
    setError("");
    setEditing(doc);
    setIsNew(false);
  }

  const manageProps = {
    busy,
    canEdit,
    onVerify: toggleVerify,
    onEdit: startEdit,
    onDelete: handleDelete,
  };
  const viewProps = { busy, onView: handleView, onDownload: handleDownload };

  const panelClass =
    "bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-navy-800">
            Quality Assurance & Accreditation
          </h1>
          <p className="text-sm text-navy-500 mt-1 max-w-xl">
            {isVerifierOnly
              ? "Open or download each document, then mark it verified once you've checked it."
              : "Upload accreditation evidence here. A restricted QAA Verifier account can view the same documents and mark them verified."}
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setError("");
              setEditing(empty());
              setIsNew(true);
            }}
          >
            <Plus size={16} /> Upload document
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Documents", value: items.length },
          { label: "Verified", value: verifiedCount },
          { label: "Awaiting review", value: items.length - verifiedCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-navy-100 shadow-sm px-4 py-3"
          >
            <p className="font-display text-2xl text-navy-800 tabular-nums">
              {stat.value}
            </p>
            <p className="text-xs text-navy-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {error && <Banner type="error">{error}</Banner>}

      <div className={panelClass}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-navy-100">
          <div className="relative flex-1 min-w-[12rem]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300 pointer-events-none"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, or filename"
              className="pl-9"
              aria-label="Search QAA documents"
            />
          </div>

          <div className="w-40 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by verification status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Awaiting review</option>
              <option value="verified">Verified</option>
            </Select>
          </div>

          <div className="w-48 shrink-0">
            <Select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              aria-label="Sort documents"
            >
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {/* Layout switch */}
          <div
            role="group"
            aria-label="Layout"
            className="flex items-center gap-1 rounded-lg border border-navy-200 p-0.5"
          >
            {[
              { key: "list", icon: List, label: "List layout" },
              { key: "cards", icon: LayoutGrid, label: "Card layout" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => changeLayout(key)}
                aria-label={label}
                aria-pressed={layout === key}
                title={label}
                className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                  layout === key
                    ? "bg-navy-100 text-navy-800"
                    : "text-navy-400 hover:text-navy-700"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Column headers — list layout only */}
        {layout === "list" && (
          <div className="hidden sm:flex items-center gap-4 px-5 py-2 bg-navy-50/60 border-b border-navy-100 text-xs font-semibold text-navy-500">
            <span className="flex-1 min-w-0">Document</span>
            <span className="w-24 shrink-0">Status</span>
            <span className="hidden lg:block w-20 shrink-0">Size</span>
            <span className="hidden lg:block w-28 shrink-0">Updated</span>
          </div>
        )}

        {/* Contents */}
        {loading ? (
          <p className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-navy-400">
            <Loader2 size={16} className="animate-spin" /> Loading documents…
          </p>
        ) : visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-navy-500">
              {filtering
                ? "No documents match those filters."
                : "No QAA documents yet."}
            </p>
            {filtering ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                }}
                className="text-sm font-semibold text-marigold-600 hover:text-marigold-500 mt-1"
              >
                Clear filters
              </button>
            ) : (
              canEdit && (
                <p className="text-sm text-navy-400 mt-1">
                  Upload your first self-study report or certificate to get
                  started.
                </p>
              )
            )}
          </div>
        ) : layout === "list" ? (
          <ul>
            {visible.map((doc) => {
              const type = doc.fileType || fileTypeFromUrl(doc.fileUrl);
              const subline =
                verificationLine(doc) ||
                doc.description ||
                doc.fileName ||
                TYPE_LABELS[type];
              return (
                <li
                  key={doc._id}
                  className="flex items-center gap-4 px-5 py-2.5 border-b border-navy-50 last:border-0 hover:bg-navy-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-navy-50 text-navy-500">
                      <FileGlyph type={type} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-navy-800 truncate">
                        {doc.title}
                      </span>
                      <span className="block text-xs text-navy-400 truncate">
                        {subline}
                      </span>
                    </span>
                  </div>

                  <div className="w-24 shrink-0 hidden sm:block">
                    <StatusPill verified={doc.status === "verified"} />
                  </div>
                  <div className="hidden lg:block w-20 shrink-0 text-xs text-navy-500 tabular-nums">
                    {formatBytes(doc.fileSize)}
                  </div>
                  <div className="hidden lg:block w-28 shrink-0 text-xs text-navy-500">
                    {formatDate(doc.updatedAt || doc.createdAt)}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <ViewDownload doc={doc} {...viewProps} />
                    <ManageActions doc={doc} {...manageProps} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((doc) => {
              const type = doc.fileType || fileTypeFromUrl(doc.fileUrl);
              const verified = doc.status === "verified";
              return (
                <article
                  key={doc._id}
                  className="flex flex-col rounded-xl border border-navy-100 overflow-hidden hover:border-navy-200 transition-colors"
                >
                  <div className="h-32 border-b border-navy-100 overflow-hidden">
                    <Thumbnail doc={doc} type={type} />
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-navy-800 leading-snug">
                        {doc.title}
                      </h3>
                      <span className="shrink-0">
                        <StatusPill verified={verified} />
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-navy-500 mt-1.5 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <p className="text-xs text-navy-400 mt-2">
                      {verificationLine(doc) || doc.fileSize
                        ? `${TYPE_LABELS[type]}, ${formatBytes(doc.fileSize)}`
                        : TYPE_LABELS[type]}
                    </p>
                    <p className="text-xs text-navy-400 mt-0.5">
                      Updated {formatDate(doc.updatedAt || doc.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-4 py-3 border-t border-navy-100 bg-navy-50/40">
                    <ViewDownload doc={doc} {...viewProps} />
                    <span className="ml-auto flex items-center gap-1.5">
                      <ManageActions doc={doc} {...manageProps} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && visible.length > 0 && (
          <p className="px-5 py-2.5 text-xs text-navy-400 border-t border-navy-100 bg-navy-50/40">
            {filtering
              ? `${visible.length} of ${items.length} document${items.length === 1 ? "" : "s"}`
              : `${items.length} document${items.length === 1 ? "" : "s"}`}
          </p>
        )}
      </div>
    </div>
  );
}
