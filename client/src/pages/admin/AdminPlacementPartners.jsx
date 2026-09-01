import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Save } from "lucide-react";
import { placementPartnersAdmin, resolveImageUrl } from "../../api/client";
import {
  Card,
  Field,
  Input,
  Button,
  IconButton,
  Banner,
  EmptyState,
} from "../../components/admin/Ui";
import ImageUpload from "../../components/admin/ImageUpload";

const empty = () => ({ name: "", logoUrl: "", websiteUrl: "", order: 0 });

export default function AdminPlacementPartners() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setItems(await placementPartnersAdmin.list());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (isNew) await placementPartnersAdmin.create(editing);
      else await placementPartnersAdmin.update(editing._id, editing);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this placement partner?")) return;
    await placementPartnersAdmin.remove(id);
    await load();
  }

  if (editing) {
    return (
      <div className="max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "New Placement Partner" : "Edit Placement Partner"}
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
            <Field label="Company name">
              <Input
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </Field>
            <Field label="Logo">
              <ImageUpload
                value={editing.logoUrl}
                onChange={(url) => setEditing({ ...editing, logoUrl: url })}
              />
            </Field>
            <Field
              label="Website URL"
              hint="Optional — makes the logo clickable"
            >
              <Input
                value={editing.websiteUrl}
                onChange={(e) =>
                  setEditing({ ...editing, websiteUrl: e.target.value })
                }
                placeholder="https://"
              />
            </Field>
            <Field label="Display order">
              <Input
                type="number"
                value={editing.order}
                onChange={(e) =>
                  setEditing({ ...editing, order: Number(e.target.value) })
                }
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
        <h1 className="font-display text-2xl text-navy-800">
          Investment Partners
        </h1>
        <Button
          onClick={() => {
            setEditing(empty());
            setIsNew(true);
          }}
        >
          <Plus size={16} /> New Partner
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState text="No placement partners yet." />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map((p) => (
            <Card key={p._id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {p.logoUrl && (
                    <img
                      src={resolveImageUrl(p.logoUrl)}
                      alt={p.name}
                      className="h-10 w-auto max-w-[100px] object-contain bg-white rounded border border-navy-100 p-1"
                    />
                  )}
                  <p className="text-sm font-semibold text-navy-800">
                    {p.name}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <IconButton
                    onClick={() => {
                      setEditing(p);
                      setIsNew(false);
                    }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(p._id)}
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
