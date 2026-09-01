import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Save, HelpCircle } from "lucide-react";
import { faqsAdmin } from "../../api/client";
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

const empty = () => ({ question: "", answer: "", order: 0 });

export default function AdminFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setFaqs(await faqsAdmin.list());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!editing.question.trim() || !editing.answer.trim()) {
      setError("Both a question and an answer are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isNew) await faqsAdmin.create(editing);
      else await faqsAdmin.update(editing._id, editing);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this FAQ?")) return;
    await faqsAdmin.remove(id);
    await load();
  }

  if (editing) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "New FAQ" : "Edit FAQ"}
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
          <Field label="Question">
            <Input
              value={editing.question}
              onChange={(e) =>
                setEditing({ ...editing, question: e.target.value })
              }
              placeholder="What programs do you offer?"
            />
          </Field>
          <Field label="Answer" className="mt-4">
            <Textarea
              rows={4}
              value={editing.answer}
              onChange={(e) =>
                setEditing({ ...editing, answer: e.target.value })
              }
              placeholder="We offer BSc. CSIT and BCA, all affiliated with Tribhuvan University."
            />
          </Field>
          <Field label="Display order" className="mt-4 max-w-[160px]">
            <Input
              type="number"
              value={editing.order}
              onChange={(e) =>
                setEditing({ ...editing, order: Number(e.target.value) })
              }
            />
          </Field>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-800">FAQs</h1>
          <p className="text-sm text-navy-500 mt-1">
            These show up in the "Chat with Admissions" widget — visitors tap a
            question and get this answer instantly, no admin needed.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(empty());
            setIsNew(true);
            setError("");
          }}
        >
          <Plus size={16} /> New FAQ
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : faqs.length === 0 ? (
        <Card>
          <EmptyState text="No FAQs yet. Add a few common questions to power the instant-answer chat widget." />
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <Card key={f._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-navy-800">{f.question}</h3>
                  <p className="text-sm text-navy-500 mt-1">{f.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <IconButton
                    onClick={() => {
                      setEditing(f);
                      setIsNew(false);
                      setError("");
                    }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(f._id)}
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
