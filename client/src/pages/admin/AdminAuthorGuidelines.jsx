import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import {
  getAuthorGuidelinesAdmin,
  updateAuthorGuidelines,
} from "../../api/client";
import { Card, Field, Input, Button, IconButton, Banner } from "../../components/admin/Ui";
import FileUpload from "../../components/admin/FileUpload";
import RichEditor from "../../components/RichEditor";

export default function AdminAuthorGuidelines() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setDoc(await getAuthorGuidelinesAdmin());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function setFile(idx, key, value) {
    setDoc((prev) => {
      const files = [...(prev.files || [])];
      files[idx] = { ...files[idx], [key]: value };
      return { ...prev, files };
    });
  }
  function addFile() {
    setDoc((prev) => ({
      ...prev,
      files: [...(prev.files || []), { name: "", fileUrl: "" }],
    }));
  }
  function removeFile(idx) {
    setDoc((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== idx),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateAuthorGuidelines(doc);
      setDoc(updated);
      setSuccess("Saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !doc) return <p className="text-sm text-navy-400">Loading…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-800">
            Author Guidelines
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Shown under Research → Author Guidelines on the public site.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      {error && <Banner type="error">{error}</Banner>}
      {success && <Banner type="success">{success}</Banner>}

      <Card title="Guidelines Content">
        <RichEditor
          value={doc.content}
          onChange={(content) => setDoc({ ...doc, content })}
          placeholder="Formatting rules, submission process, citation style, word limits…"
        />
      </Card>

      <Card
        title="Downloadable Templates / Checklists"
        description="Optional PDF or Word files authors can download — e.g. a manuscript template or a submission checklist."
        action={
          <Button variant="secondary" onClick={addFile}>
            <Plus size={16} /> Add file
          </Button>
        }
      >
        {(doc.files || []).length === 0 ? (
          <p className="text-sm text-navy-400">No files added yet.</p>
        ) : (
          <div className="space-y-4">
            {doc.files.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-navy-100 p-3"
              >
                <div className="flex-1 space-y-2">
                  <Field label="Display Name">
                    <Input
                      value={f.name}
                      onChange={(e) => setFile(i, "name", e.target.value)}
                      placeholder="e.g. 'Manuscript Template'"
                    />
                  </Field>
                  <Field label="File">
                    <FileUpload
                      value={f.fileUrl}
                      onChange={(url) => setFile(i, "fileUrl", url)}
                      allowWord
                    />
                  </Field>
                </div>
                <IconButton variant="danger" onClick={() => removeFile(i)}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
