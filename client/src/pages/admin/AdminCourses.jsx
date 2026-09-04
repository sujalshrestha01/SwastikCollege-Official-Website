import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { coursesAdmin } from "../../api/client";
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

const emptyCourse = () => ({
  slug: "",
  name: "",
  tagline: "",
  duration: "4 years · 8 semesters",
  seats: 48,
  description: "",
  eligibility: [""],
  semesters: [{ title: "Semester I", subjects: [{ name: "", code: "" }] }],
  syllabusUrl: "",
  isActive: true,
  order: 0,
});

function slugify(text) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // Fallback for names with no a-z0-9 characters (e.g. non-English course
  // names) so we never generate an empty/duplicate slug that the server
  // would reject with a confusing "duplicate key" error.
  return base || `course-${Date.now().toString(36)}`;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // course object being edited, or null
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  async function load() {
    setLoading(true);
    const data = await coursesAdmin.list();
    setCourses(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEditing(emptyCourse());
    setIsNew(true);
    setError("");
  }

  function startEdit(course) {
    setEditing(JSON.parse(JSON.stringify(course)));
    setIsNew(false);
    setError("");
  }

  async function handleDelete(slug) {
    if (!confirm("Delete this course permanently? This cannot be undone."))
      return;
    try {
      await coursesAdmin.remove(slug);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...editing,
        slug: editing.slug || slugify(editing.name),
        eligibility: editing.eligibility.filter((e) => e.trim() !== ""),
        semesters: editing.semesters.map((s) => ({
          title: s.title,
          subjects: s.subjects.filter((sub) => sub.name.trim() !== ""),
        })),
      };
      if (isNew) {
        await coursesAdmin.create(payload);
      } else {
        await coursesAdmin.update(editing.slug, payload);
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function updateField(key, value) {
    setEditing((prev) => ({ ...prev, [key]: value }));
  }

  function updateEligibility(index, value) {
    setEditing((prev) => {
      const eligibility = [...prev.eligibility];
      eligibility[index] = value;
      return { ...prev, eligibility };
    });
  }
  function addEligibility() {
    setEditing((prev) => ({ ...prev, eligibility: [...prev.eligibility, ""] }));
  }
  function removeEligibility(index) {
    setEditing((prev) => ({
      ...prev,
      eligibility: prev.eligibility.filter((_, i) => i !== index),
    }));
  }

  function addSemester() {
    setEditing((prev) => ({
      ...prev,
      semesters: [
        ...prev.semesters,
        {
          title: `Semester ${prev.semesters.length + 1}`,
          subjects: [{ name: "", code: "" }],
        },
      ],
    }));
  }
  function removeSemester(sIdx) {
    setEditing((prev) => ({
      ...prev,
      semesters: prev.semesters.filter((_, i) => i !== sIdx),
    }));
  }
  function updateSemesterTitle(sIdx, value) {
    setEditing((prev) => {
      const semesters = [...prev.semesters];
      semesters[sIdx] = { ...semesters[sIdx], title: value };
      return { ...prev, semesters };
    });
  }
  function addSubject(sIdx) {
    setEditing((prev) => {
      const semesters = [...prev.semesters];
      semesters[sIdx] = {
        ...semesters[sIdx],
        subjects: [
          ...(semesters[sIdx].subjects || []),
          { name: "", code: "" },
        ],
      };
      return { ...prev, semesters };
    });
  }
  function updateSubject(sIdx, subIdx, key, value) {
    setEditing((prev) => {
      const semesters = [...prev.semesters];
      const subjects = [...semesters[sIdx].subjects];
      subjects[subIdx] = { ...subjects[subIdx], [key]: value };
      semesters[sIdx] = { ...semesters[sIdx], subjects };
      return { ...prev, semesters };
    });
  }
  function removeSubject(sIdx, subIdx) {
    setEditing((prev) => {
      const semesters = [...prev.semesters];
      semesters[sIdx] = {
        ...semesters[sIdx],
        subjects: semesters[sIdx].subjects.filter((_, i) => i !== subIdx),
      };
      return { ...prev, semesters };
    });
  }

  if (editing) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy-800">
            {isNew ? "Add Course" : `Edit ${editing.name}`}
          </h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              <X size={16} /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saving ? "Saving…" : "Save Course"}
            </Button>
          </div>
        </div>

        {error && <Banner type="error">{error}</Banner>}

        <Card title="Basic details">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Course name">
              <Input
                value={editing.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="BSc. CSIT"
              />
            </Field>
            <Field
              label="URL slug"
              hint="Used in the program page link. Auto-generated if left blank on create."
            >
              <Input
                value={editing.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="bsc-csit"
                disabled={!isNew}
              />
            </Field>
            <Field label="Tagline">
              <Input
                value={editing.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
                placeholder="Computer Science & Information Technology"
              />
            </Field>
            <Field label="Duration">
              <Input
                value={editing.duration}
                onChange={(e) => updateField("duration", e.target.value)}
              />
            </Field>
            <Field label="Seats available">
              <Input
                type="number"
                value={editing.seats}
                onChange={(e) => updateField("seats", Number(e.target.value))}
              />
            </Field>
            <Field label="Syllabus / brochure PDF">
              <FileUpload
                value={editing.syllabusUrl}
                onChange={(url) => updateField("syllabusUrl", url)}
                accept="application/pdf"
                hint="Upload the syllabus PDF for this course"
              />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first">
              <Input
                type="number"
                value={editing.order}
                onChange={(e) => updateField("order", Number(e.target.value))}
              />
            </Field>
            <Field label="Visible on public site?">
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                />
                <span className="text-sm text-navy-700">
                  Show this course on the website
                </span>
              </label>
            </Field>
          </div>
          <Field label="Description" className="mt-4">
            <Textarea
              rows={3}
              value={editing.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </Field>
        </Card>

        <Card
          title="Eligibility requirements"
          action={
            <Button variant="secondary" onClick={addEligibility}>
              <Plus size={16} /> Add
            </Button>
          }
        >
          <div className="space-y-2">
            {editing.eligibility.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateEligibility(i, e.target.value)}
                  placeholder="Eligibility requirement"
                />
                <IconButton
                  variant="danger"
                  onClick={() => removeEligibility(i)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Semesters & subjects"
          description="Add, edit, or remove any semester and its subjects — e.g. Semester I of BSc. CSIT."
          action={
            <Button variant="secondary" onClick={addSemester}>
              <Plus size={16} /> Add semester
            </Button>
          }
        >
          <div className="space-y-4">
            {editing.semesters.map((sem, sIdx) => (
              <div key={sIdx} className="border border-navy-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Input
                    value={sem.title}
                    onChange={(e) => updateSemesterTitle(sIdx, e.target.value)}
                    className="max-w-xs font-semibold"
                  />
                  <div className="flex-1" />
                  <IconButton
                    variant="danger"
                    onClick={() => removeSemester(sIdx)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
                <div className="space-y-2">
                  {(sem.subjects || []).map((sub, subIdx) => (
                    <div
                      key={subIdx}
                      className="grid grid-cols-[1fr_100px_36px] gap-2 items-center"
                    >
                      <Input
                        placeholder="Subject name"
                        value={sub.name}
                        onChange={(e) =>
                          updateSubject(sIdx, subIdx, "name", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Code"
                        value={sub.code}
                        onChange={(e) =>
                          updateSubject(sIdx, subIdx, "code", e.target.value)
                        }
                      />
                      {/* <Input
                        type="number"
                        placeholder="Credit"
                        value={sub.creditHours}
                        onChange={(e) =>
                          updateSubject(
                            sIdx,
                            subIdx,
                            "creditHours",
                            Number(e.target.value),
                          )
                        }
                      /> */}
                      <IconButton
                        variant="danger"
                        onClick={() => removeSubject(sIdx, subIdx)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() => addSubject(sIdx)}
                >
                  <Plus size={15} /> Add subject
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditing(null)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Course"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-800">
            Courses & Subjects
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Add or remove programs, and edit each semester's subjects.
          </p>
        </div>
        <Button onClick={startNew}>
          <Plus size={16} /> Add Course
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-navy-400">Loading…</p>
      ) : courses.length === 0 ? (
        <Card>
          <EmptyState text="No courses yet. Add your first program." />
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.slug}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-navy-800">
                      {course.name}
                    </h3>
                    {!course.isActive && (
                      <span className="text-xs bg-navy-100 text-navy-500 px-2 py-0.5 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-navy-500">{course.tagline}</p>
                  <p className="text-xs text-navy-400 mt-1">
                    {course.duration} · {course.seats} seats ·{" "}
                    {course.semesters?.length || 0} semesters listed
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <IconButton
                    onClick={() =>
                      setExpanded((p) => ({
                        ...p,
                        [course.slug]: !p[course.slug],
                      }))
                    }
                  >
                    {expanded[course.slug] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </IconButton>
                  <IconButton onClick={() => startEdit(course)}>
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    variant="danger"
                    onClick={() => handleDelete(course.slug)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
              {expanded[course.slug] && (
                <div className="mt-4 pt-4 border-t border-navy-100 grid md:grid-cols-2 gap-3">
                  {(course.semesters || []).map((sem, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-semibold text-navy-700">{sem.title}</p>
                      <ul className="text-navy-500 list-disc pl-4">
                        {(sem.subjects?.length
                          ? sem.subjects.map((s) => s.name)
                          : sem.courses || []
                        ).map((name, j) => (
                          <li key={j}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
