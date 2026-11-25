import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Save } from "lucide-react";
import { noticesAdmin } from "../../api/client";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  IconButton,
  Banner,
  EmptyState,
} from "../../components/admin/Ui";
import FileUpload from "../../components/admin/FileUpload";

const categories = ["Exams", "Admissions", "Scholarships", "Events", "General"];
const empty = () => ({
  title: "",
  category: "General",
  date: new Date().toISOString().slice(0, 10),
  excerpt: "",
  fileUrl: "",
  linkUrl: "",
});

export default function AdminNotices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setItems(await noticesAdmin.list());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (isNew) await noticesAdmin.create(editing);
      else await noticesAdmin.update(editing._id, editing);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this notice?")) return;
    await noticesAdmin.remove(id);
    await load();
  }

  if (editing) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "New Notice" : "Edit Notice"}
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
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <Select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Date">
                <Input
                  type="date"
                  value={String(editing.date).slice(0, 10)}
                  onChange={(e) =>
                    setEditing({ ...editing, date: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Excerpt / summary">
              <Textarea
                rows={3}
                value={editing.excerpt}
                onChange={(e) =>
                  setEditing({ ...editing, excerpt: e.target.value })
                }
              />
            </Field>
            <Field
              label="Related page link (optional)"
              hint='Shows a "View details" button, e.g. /scholarships'
            >
              <Input
                value={editing.linkUrl || ""}
                placeholder="/scholarships"
                onChange={(e) =>
                  setEditing({ ...editing, linkUrl: e.target.value })
                }
              />
            </Field>
            <Field
              label="Attached file"
              hint="Upload a PDF or image, if any — visitors will be able to download it"
            >
              <FileUpload
                value={editing.fileUrl}
                onChange={(url) => setEditing({ ...editing, fileUrl: url })}
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
        <h1 className="font-display text-2xl text-navy-800">Notice Board</h1>
        <Button
          onClick={() => {
            setEditing(empty());
            setIsNew(true);
          }}
        >
          <Plus size={16} /> New Notice
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState text="No notices yet." />
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-marigold-500 font-semibold">
                    {n.category}
                  </span>
                  <h3 className="font-display text-navy-800">{n.title}</h3>
                  <p className="text-xs text-navy-400 mt-1">
                    {new Date(n.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-navy-500 mt-1">{n.excerpt}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <IconButton
                    onClick={() => {
                      setEditing(n);
                      setIsNew(false);
                    }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(n._id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
