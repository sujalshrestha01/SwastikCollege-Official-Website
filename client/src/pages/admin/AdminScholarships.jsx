import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Save, UserPlus } from "lucide-react";
import { scholarshipsAdmin } from "../../api/client";
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
  Switch,
} from "../../components/admin/Ui";
import FileUpload from "../../components/admin/FileUpload";

const GENDERS = ["Male", "Female", "Other"];
const emptyStudent = () => ({ name: "", rollNo: "", gender: "" });
const empty = () => ({
  title: "",
  program: "BCA",
  batch: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  fileUrl: "",
  students: [emptyStudent()],
  published: true,
});

export default function AdminScholarships() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setItems(await scholarshipsAdmin.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function set(field, value) {
    setEditing((prev) => ({ ...prev, [field]: value }));
  }

  function setStudent(index, field, value) {
    setEditing((prev) => ({
      ...prev,
      students: prev.students.map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      // Drop blank rows so an unused "add student" row doesn't fail validation.
      const payload = {
        ...editing,
        students: editing.students.filter((s) => s.name.trim()),
      };
      if (isNew) await scholarshipsAdmin.create(payload);
      else await scholarshipsAdmin.update(editing._id, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this scholarship list?")) return;
    await scholarshipsAdmin.remove(id);
    await load();
  }

  if (editing) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "New Scholarship List" : "Edit Scholarship List"}
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

        <Card title="Details">
          <div className="space-y-4">
            <Field
              label="Title"
              hint='e.g. "BCA Scholarship Recipients – 2083 Batch"'
            >
              <Input
                value={editing.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Program">
                <Input
                  value={editing.program}
                  onChange={(e) => set("program", e.target.value)}
                />
              </Field>
              <Field label="Batch" hint="e.g. 2083">
                <Input
                  value={editing.batch}
                  onChange={(e) => set("batch", e.target.value)}
                />
              </Field>
              <Field label="Published date">
                <Input
                  type="date"
                  value={String(editing.date || "").slice(0, 10)}
                  onChange={(e) => set("date", e.target.value)}
                />
              </Field>
            </div>
            <Field
              label="Description"
              hint="Intro text shown above the list (line breaks are kept)"
            >
              <Textarea
                rows={5}
                value={editing.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field
              label="Original TU notice (optional)"
              hint="Upload the scanned letter from TU — visitors can view it"
            >
              <FileUpload
                value={editing.fileUrl}
                onChange={(url) => set("fileUrl", url)}
              />
            </Field>
            <div className="flex items-center gap-3">
              <Switch
                checked={editing.published}
                onChange={(v) => set("published", v)}
              />
              <span className="text-sm text-navy-600">
                {editing.published
                  ? "Published — visible on the website"
                  : "Draft — hidden from the website"}
              </span>
            </div>
          </div>
        </Card>

        <Card
          title="Students"
          description="Rows with an empty name are ignored when saving."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                set("students", [...editing.students, emptyStudent()])
              }
            >
              <UserPlus size={14} /> Add student
            </Button>
          }
        >
          <div className="space-y-3">
            {editing.students.length === 0 && (
              <EmptyState text="No students added yet." />
            )}
            {editing.students.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-[2rem_1fr] sm:grid-cols-[2rem_2fr_1.3fr_1fr_auto] gap-2 items-center"
              >
                <span className="text-sm font-mono text-navy-400">
                  {i + 1}.
                </span>
                <Input
                  placeholder="Student name"
                  value={s.name}
                  onChange={(e) => setStudent(i, "name", e.target.value)}
                />
                <Input
                  placeholder="Entrance roll no."
                  value={s.rollNo}
                  onChange={(e) => setStudent(i, "rollNo", e.target.value)}
                  className="col-start-2 sm:col-start-auto"
                />
                <Select
                  value={s.gender}
                  onChange={(e) => setStudent(i, "gender", e.target.value)}
                  className="col-start-2 sm:col-start-auto"
                >
                  <option value="">Gender…</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
                <IconButton
                  variant="danger"
                  className="col-start-2 sm:col-start-auto justify-self-start"
                  onClick={() =>
                    set(
                      "students",
                      editing.students.filter((_, idx) => idx !== i),
                    )
                  }
                  title="Remove student"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy-800">Scholarships</h1>
        <Button
          onClick={() => {
            setEditing(empty());
            setIsNew(true);
            setError("");
          }}
        >
          <Plus size={16} /> New List
        </Button>
      </div>
      {error && <Banner type="error">{error}</Banner>}
      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState text="No scholarship lists yet." />
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-marigold-500 font-semibold">
                    {[item.program, item.batch && `${item.batch} Batch`]
                      .filter(Boolean)
                      .join(" · ")}
                    {!item.published && (
                      <span className="ml-2 text-navy-400">(Draft)</span>
                    )}
                  </span>
                  <h3 className="font-display text-navy-800">{item.title}</h3>
                  <p className="text-xs text-navy-400 mt-1">
                    {item.students?.length || 0} student
                    {item.students?.length === 1 ? "" : "s"}
                    {item.date
                      ? ` · ${new Date(item.date).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <IconButton
                    onClick={() => {
                      setEditing({
                        ...item,
                        students: item.students?.length
                          ? item.students
                          : [emptyStudent()],
                      });
                      setIsNew(false);
                      setError("");
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
