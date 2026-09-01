import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Save, FileText, FileImage } from "lucide-react";
import { journalsAdmin } from "../../api/client";
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

const empty = () => ({
  title: "",
  issueNumber: "",
  publishedYear: "",
  description: "",
  fileUrl: "",
  coverImageUrl: "",
});

export default function AdminJournals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setItems(await journalsAdmin.list());
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
      setError("Please upload the journal issue file before saving");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isNew) await journalsAdmin.create(editing);
      else await journalsAdmin.update(editing._id, editing);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this journal issue?")) return;
    await journalsAdmin.remove(id);
    await load();
  }

  if (editing) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "New Journal Issue" : "Edit Journal Issue"}
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
                placeholder="e.g. 'Swastik Journal of Applied Sciences'"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Issue Number">
                <Input
                  value={editing.issueNumber}
                  onChange={(e) =>
                    setEditing({ ...editing, issueNumber: e.target.value })
                  }
                  placeholder="e.g. 'Vol. 3, Issue 1'"
                />
              </Field>
              <Field label="Published Year">
                <Input
                  value={editing.publishedYear}
                  onChange={(e) =>
                    setEditing({ ...editing, publishedYear: e.target.value })
                  }
                  placeholder="e.g. '2026'"
                />
              </Field>
            </div>
            <Field label="Description (optional)">
              <Textarea
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                placeholder="What this issue covers…"
              />
            </Field>
            <Field
              label="Cover Image (optional)"
              hint="Shown as a thumbnail on the public Journals list"
            >
              <FileUpload
                value={editing.coverImageUrl}
                onChange={(url) =>
                  setEditing({ ...editing, coverImageUrl: url })
                }
                accept="image/*"
              />
            </Field>
            <Field
              label="Journal File"
              hint="Upload the full issue as a PDF or Word document"
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
          <h1 className="font-display text-2xl text-navy-800">Journals</h1>
          <p className="text-sm text-navy-500 mt-1">
            Shown under Research → Journals on the public site.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(empty());
            setIsNew(true);
          }}
        >
          <Plus size={16} /> New Journal Issue
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState text="No journal issues yet — add the first one." />
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isPdf = /\.pdf($|\?)/i.test(item.fileUrl || "");
            return (
              <Card key={item._id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-navy-50 text-navy-500">
                      {isPdf ? <FileText size={18} /> : <FileImage size={18} />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs uppercase tracking-wide text-marigold-500 font-semibold">
                        {item.issueNumber || item.publishedYear}
                      </span>
                      <h3 className="font-display text-navy-800 truncate">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
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
