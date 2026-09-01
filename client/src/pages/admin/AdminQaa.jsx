import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  FileText,
  FileImage,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { qaaAdmin, verifyQaaDocument } from "../../api/client";
import {
  Card,
  Field,
  Input,
  Textarea,
  Button,
  IconButton,
  Banner,
  EmptyState,
} from "../../components/admin/Ui";
import FileUpload from "../../components/admin/FileUpload";
import { useAuth } from "../../context/AuthContext";

const empty = () => ({
  title: "",
  description: "",
  fileUrl: "",
  fileType: "pdf",
});

function fileTypeFromUrl(url = "") {
  if (/\.docx($|\?)/i.test(url)) return "docx";
  if (/\.doc($|\?)/i.test(url)) return "doc";
  return "pdf";
}

export default function AdminQaa() {
  const { admin } = useAuth();
  const isVerifierOnly = admin?.role === "qaaVerifier";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setItems(await qaaAdmin.list());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!editing.title.trim()) {
      setError("Please add a title before saving");
      return;
    }
    if (!editing.fileUrl) {
      setError("Please upload the document before saving");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...editing, fileType: fileTypeFromUrl(editing.fileUrl) };
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

  async function handleDelete(id) {
    if (!confirm("Delete this QAA document?")) return;
    await qaaAdmin.remove(id);
    await load();
  }

  async function toggleVerify(item) {
    setBusyId(item._id);
    setError("");
    try {
      const nextStatus = item.status === "verified" ? "pending" : "verified";
      await verifyQaaDocument(item._id, nextStatus);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (editing) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "New QAA Document" : "Edit QAA Document"}
          </h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              <X size={16} /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? "Saving…" : "Save"}
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
                placeholder="e.g. 'Self-Study Report 2026'"
              />
            </Field>
            <Field label="Description (optional)">
              <Textarea
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </Field>
            <Field
              label="Document"
              hint="Upload a PDF or Word document for the external verifier to review"
            >
              <FileUpload
                value={editing.fileUrl}
                onChange={(url) => setEditing({ ...editing, fileUrl: url })}
                allowWord
              />
            </Field>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-800">
            Quality Assurance & Accreditation
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            {isVerifierOnly
              ? "Review each document and mark it verified once you've checked it."
              : "Upload QAA documents here. A separate, restricted QAA Verifier account (see User Management) can mark them verified."}
          </p>
        </div>
        {!isVerifierOnly && (
          <Button
            onClick={() => {
              setEditing(empty());
              setIsNew(true);
            }}
          >
            <Plus size={16} /> New Document
          </Button>
        )}
      </div>
      {error && <Banner type="error">{error}</Banner>}
      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState text="No QAA documents uploaded yet." />
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isPdf = /\.pdf($|\?)/i.test(item.fileUrl || "");
            const verified = item.status === "verified";
            return (
              <Card key={item._id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-navy-50 text-navy-500">
                      {isPdf ? <FileText size={18} /> : <FileImage size={18} />}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          verified
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {verified ? "Verified" : "Pending"}
                      </span>
                      <h3 className="font-display text-navy-800 truncate mt-1">
                        {item.title}
                      </h3>
                      {verified && item.verifiedBy && (
                        <p className="text-xs text-navy-400 mt-0.5">
                          Verified by {item.verifiedBy}
                          {item.verifiedAt &&
                            ` on ${new Date(item.verifiedAt).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <IconButton
                      onClick={() => toggleVerify(item)}
                      disabled={busyId === item._id}
                      title={verified ? "Mark as pending" : "Mark as verified"}
                    >
                      {verified ? (
                        <ShieldAlert size={16} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                    </IconButton>
                    {!isVerifierOnly && (
                      <>
                        <IconButton
                          onClick={() => {
                            setEditing(item);
                            setIsNew(false);
                          }}
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          variant="danger"
                          onClick={() => handleDelete(item._id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
