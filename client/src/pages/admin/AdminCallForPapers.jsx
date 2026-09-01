import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Save } from "lucide-react";
import { callForPapersAdmin } from "../../api/client";
import {
  Card,
  Field,
  Input,
  Select,
  Button,
  IconButton,
  Banner,
  EmptyState,
} from "../../components/admin/Ui";
import FileUpload from "../../components/admin/FileUpload";
import RichEditor from "../../components/RichEditor";

const empty = () => ({
  title: "",
  description: "",
  deadline: "",
  status: "open",
  fileUrl: "",
});

function toDateInputValue(d) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function AdminCallForPapers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setItems(await callForPapersAdmin.list());
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
    setSaving(true);
    setError("");
    try {
      if (isNew) await callForPapersAdmin.create(editing);
      else await callForPapersAdmin.update(editing._id, editing);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this call for paper?")) return;
    await callForPapersAdmin.remove(id);
    await load();
  }

  if (editing) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "New Call for Paper" : "Edit Call for Paper"}
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
                placeholder="e.g. 'Call for Papers — Journal of Applied Sciences, Vol. 4'"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Submission Deadline">
                <Input
                  type="date"
                  value={toDateInputValue(editing.deadline)}
                  onChange={(e) =>
                    setEditing({ ...editing, deadline: e.target.value })
                  }
                />
              </Field>
              <Field label="Status">
                <Select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value })
                  }
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </Select>
              </Field>
            </div>
            <Field label="Details">
              <RichEditor
                value={editing.description}
                onChange={(description) =>
                  setEditing({ ...editing, description })
                }
                placeholder="Scope, submission guidelines, contact info…"
              />
            </Field>
            <Field
              label="Attached Notice (optional)"
              hint="Upload a PDF or Word document with the full call for paper notice"
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
            Call for Paper
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Shown under Research → Call for Paper on the public site.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(empty());
            setIsNew(true);
          }}
        >
          <Plus size={16} /> New Call for Paper
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState text="No call for paper postings yet." />
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item._id}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.status === "open"
                          ? "bg-green-50 text-green-700"
                          : "bg-navy-100 text-navy-600"
                      }`}
                    >
                      {item.status === "open" ? "Open" : "Closed"}
                    </span>
                    {item.deadline && (
                      <span className="text-xs text-navy-400">
                        Deadline: {toDateInputValue(item.deadline)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-navy-800 truncate mt-1">
                    {item.title}
                  </h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  <IconButton
                    onClick={() => {
                      setEditing({
                        ...item,
                        deadline: toDateInputValue(item.deadline),
                      });
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
          ))}
        </div>
      )}
    </div>
  );
}
