import { useEffect, useState } from "react";

import {
  Save,
  Plus,
  Trash2,
  Link as LinkIcon,
  ToggleLeft,
  Eye,
  GraduationCap,
  Users,
  Lightbulb,
  HeartHandshake,
  Trophy,
  Target,
  Compass,
  BookOpenCheck,
  FileDown,
} from "lucide-react";

import { Link as RouterLink } from "react-router";

import { getSettings, updateSettings } from "../../api/client";

import {
  Card,
  Field,
  Input,
  Select,
  Button,
  IconButton,
  Banner,
  Textarea,
} from "../../components/admin/Ui";

import ImageUpload from "../../components/admin/ImageUpload";
import { useSettings } from "../../context/SettingsContext";
import HeroCarouselUpload from "../../components/admin/HeroCarouselUpload";

const ICON_OPTIONS = [
  "GraduationCap",
  "Users",
  "Lightbulb",
  "HeartHandshake",
  "Trophy",
  "Target",
  "Compass",
  "BookOpenCheck",
];

const COLOR_OPTIONS = ["blue", "emerald", "amber", "rose"];

export default function AdminSettings() {
  const { refresh } = useSettings();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  function set(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setFeature(key, value) {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...(prev.features || {}),
        [key]: value,
      },
    }));
  }

  function setSocial(key, value) {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  }

  function setStat(idx, key, value) {
    setSettings((prev) => {
      const stats = [...prev.stats];
      stats[idx] = { ...stats[idx], [key]: value };

      return { ...prev, stats };
    });
  }

  function addStat() {
    setSettings((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { label: "", value: 0, suffix: "" }],
    }));
  }

  function removeStat(idx) {
    setSettings((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== idx),
    }));
  }

  function setHeroStatusRow(idx, key, value) {
    setSettings((prev) => {
      const rows = [...(prev.heroStatusLog || [])];

      rows[idx] = {
        ...rows[idx],
        [key]: value,
      };

      return {
        ...prev,
        heroStatusLog: rows,
      };
    });
  }

  function addHeroStatusRow() {
    setSettings((prev) => ({
      ...prev,
      heroStatusLog: [...(prev.heroStatusLog || []), { label: "", value: "" }],
    }));
  }

  function removeHeroStatusRow(idx) {
    setSettings((prev) => ({
      ...prev,
      heroStatusLog: prev.heroStatusLog.filter((_, i) => i !== idx),
    }));
  }

  function setWhyChooseUsItem(idx, key, value) {
    setSettings((prev) => {
      const items = [...(prev.whyChooseUs || [])];

      items[idx] = {
        ...items[idx],
        [key]: value,
      };

      return {
        ...prev,
        whyChooseUs: items,
      };
    });
  }

  function addWhyChooseUsItem() {
    setSettings((prev) => ({
      ...prev,
      whyChooseUs: [
        ...(prev.whyChooseUs || []),
        {
          icon: "GraduationCap",
          title: "",
          description: "",
        },
      ],
    }));
  }

  function removeWhyChooseUsItem(idx) {
    setSettings((prev) => ({
      ...prev,
      whyChooseUs: prev.whyChooseUs.filter((_, i) => i !== idx),
    }));
  }

  // ---- About page content (timeline / values / leadership quote) ----

  function setAboutField(section, idx, key, value) {
    setSettings((prev) => {
      const list = [...(prev.about?.[section] || [])];

      list[idx] = {
        ...list[idx],
        [key]: value,
      };

      return {
        ...prev,
        about: {
          ...prev.about,
          [section]: list,
        },
      };
    });
  }

  function addAboutItem(section, empty) {
    setSettings((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        [section]: [...(prev.about?.[section] || []), empty],
      },
    }));
  }

  function removeAboutItem(section, idx) {
    setSettings((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        [section]: (prev.about?.[section] || []).filter((_, i) => i !== idx),
      },
    }));
  }

  function setLeadership(key, value) {
    setSettings((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        leadership: {
          ...prev.about?.leadership,
          [key]: value,
        },
      },
    }));
  }

  // ---- Board of Directors ----

  function setBoardMember(idx, key, value) {
    setSettings((prev) => {
      const boardOfDirectors = [...(prev.about?.boardOfDirectors || [])];

      boardOfDirectors[idx] = {
        ...boardOfDirectors[idx],
        [key]: value,
      };

      return {
        ...prev,
        about: {
          ...prev.about,
          boardOfDirectors,
        },
      };
    });
  }

  function addBoardMember() {
    setSettings((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        boardOfDirectors: [
          ...(prev.about?.boardOfDirectors || []),
          {
            name: "",
            position: "",
            photoUrl: "",
            description: "",
            order: (prev.about?.boardOfDirectors?.length || 0) + 1,
            isActive: true,
          },
        ],
      },
    }));
  }

  function removeBoardMember(idx) {
    setSettings((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        boardOfDirectors: (prev.about?.boardOfDirectors || []).filter(
          (_, i) => i !== idx,
        ),
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const updated = await updateSettings(settings);

      setSettings(updated);

      await refresh();

      setMessage({
        type: "success",
        text: "Settings saved and live on the site.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <p className="text-sm text-navy-400">Loading…</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between sticky -top-10 bg-paper z-10 py-2">
        <div>
          <h1 className="font-display text-2xl text-navy-800">Site Settings</h1>

          <p className="text-sm text-navy-500 mt-1">
            Every small detail — social links, contact info, homepage content,
            footer.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? "Saving…" : "Save All Changes"}
        </Button>
      </div>

      {message && <Banner type={message.type}>{message.text}</Banner>}

      <Card title="College identity">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="College name">
            <Input
              value={settings.collegeName}
              onChange={(e) => set("collegeName", e.target.value)}
            />
          </Field>

          <Field
            label="Short name"
            hint="Used in compact spaces like the navbar"
          >
            <Input
              value={settings.collegeShortName}
              onChange={(e) => set("collegeShortName", e.target.value)}
            />
          </Field>

          <Field label="Established year">
            <Input
              value={settings.establishedYear}
              onChange={(e) => set("establishedYear", e.target.value)}
            />
          </Field>

          <Field label="Affiliation">
            <Input
              value={settings.affiliation}
              onChange={(e) => set("affiliation", e.target.value)}
            />
          </Field>

          <Field label="Logo">
            <ImageUpload
              value={settings.logoUrl}
              onChange={(url) => set("logoUrl", url)}
              shape="square"
            />
          </Field>
        </div>
      </Card>

      <Card title="Homepage hero section">
        <div className="space-y-4">
          <Field label="Headline">
            <Input
              value={settings.heroHeadline}
              onChange={(e) => set("heroHeadline", e.target.value)}
            />
          </Field>

          <Field label="Subheadline">
            <Textarea
              rows={2}
              value={settings.heroSubheadline}
              onChange={(e) => set("heroSubheadline", e.target.value)}
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Call-to-action text">
              <Input
                value={settings.heroCtaText}
                onChange={(e) => set("heroCtaText", e.target.value)}
              />
            </Field>

            <Field label="Call-to-action link">
              <Input
                value={settings.heroCtaLink}
                onChange={(e) => set("heroCtaLink", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Hero image">
            <ImageUpload
              value={settings.heroImageUrl}
              onChange={(url) => set("heroImageUrl", url)}
            />
          </Field>

          <Field
            label="Hero carousel images"
            hint="If any images are added here, the carousel replaces the single hero image above."
          >
            <HeroCarouselUpload
              images={settings.heroImages || []}
              onChange={(images) => set("heroImages", images)}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Homepage Hero status log card"
        description="The terminal-style card shown next to the hero headline. Leave 'Value' blank on college/affiliation/contact rows to auto-fill from College Identity / Contact info above."
        action={
          <Button variant="secondary" onClick={addHeroStatusRow}>
            <Plus size={16} /> Add row
          </Button>
        }
      >
        <div className="space-y-2">
          {(settings.heroStatusLog || []).map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_36px] gap-2">
              <Input
                placeholder="Label (e.g. college)"
                value={row.label}
                onChange={(e) => setHeroStatusRow(i, "label", e.target.value)}
              />

              <Input
                placeholder="Value (optional)"
                value={row.value}
                onChange={(e) => setHeroStatusRow(i, "value", e.target.value)}
              />

              <IconButton
                variant="danger"
                onClick={() => removeHeroStatusRow(i)}
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Homepage Why Choose Us cards"
        description="The four feature cards shown on the homepage under 'Why Choose Us?'"
        action={
          <Button variant="secondary" onClick={addWhyChooseUsItem}>
            <Plus size={16} /> Add card
          </Button>
        }
      >
        <div className="space-y-3">
          {(settings.whyChooseUs || []).map((item, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[140px_1fr_36px] gap-2 items-start bg-navy-50/50 p-3 rounded-lg"
            >
              <Select
                value={item.icon}
                onChange={(e) => setWhyChooseUsItem(i, "icon", e.target.value)}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>

              <div className="space-y-2">
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) =>
                    setWhyChooseUsItem(i, "title", e.target.value)
                  }
                />

                <Textarea
                  rows={2}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    setWhyChooseUsItem(i, "description", e.target.value)
                  }
                />
              </div>

              <IconButton
                variant="danger"
                onClick={() => removeWhyChooseUsItem(i)}
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
        </div>
      </Card>

      <Card title="About, mission & vision">
        <div className="space-y-4">
          <Field label="About summary">
            <Textarea
              rows={3}
              value={settings.aboutSummary}
              onChange={(e) => set("aboutSummary", e.target.value)}
            />
          </Field>

          <Field label="Mission statement">
            <Textarea
              rows={2}
              value={settings.missionStatement}
              onChange={(e) => set("missionStatement", e.target.value)}
            />
          </Field>

          <Field label="Vision statement">
            <Textarea
              rows={2}
              value={settings.visionStatement}
              onChange={(e) => set("visionStatement", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="About page — Our Journey timeline"
        description="Shown as the milestone timeline on the About page"
        action={
          <Button
            variant="secondary"
            onClick={() =>
              addAboutItem("timeline", {
                year: "",
                title: "",
                description: "",
              })
            }
          >
            <Plus size={16} /> Add milestone
          </Button>
        }
      >
        <div className="space-y-3">
          {(settings.about?.timeline || []).map((item, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[100px_1fr_36px] gap-2 items-start bg-navy-50/50 p-3 rounded-lg"
            >
              <Input
                placeholder="Year"
                value={item.year}
                onChange={(e) =>
                  setAboutField("timeline", i, "year", e.target.value)
                }
              />

              <div className="space-y-2">
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) =>
                    setAboutField("timeline", i, "title", e.target.value)
                  }
                />

                <Textarea
                  rows={2}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    setAboutField("timeline", i, "description", e.target.value)
                  }
                />
              </div>

              <IconButton
                variant="danger"
                onClick={() => removeAboutItem("timeline", i)}
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="About page — Core Values"
        description="Shown as the 'What Sets Us Apart' cards on the About page"
        action={
          <Button
            variant="secondary"
            onClick={() =>
              addAboutItem("values", {
                icon: "GraduationCap",
                colorKey: "blue",
                title: "",
                text: "",
              })
            }
          >
            <Plus size={16} /> Add value
          </Button>
        }
      >
        <div className="space-y-3">
          {(settings.about?.values || []).map((item, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[120px_100px_1fr_36px] gap-2 items-start bg-navy-50/50 p-3 rounded-lg"
            >
              <Select
                value={item.icon}
                onChange={(e) =>
                  setAboutField("values", i, "icon", e.target.value)
                }
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>

              <Select
                value={item.colorKey}
                onChange={(e) =>
                  setAboutField("values", i, "colorKey", e.target.value)
                }
              >
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>

              <div className="space-y-2">
                <Input
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) =>
                    setAboutField("values", i, "title", e.target.value)
                  }
                />

                <Textarea
                  rows={2}
                  placeholder="Description"
                  value={item.text}
                  onChange={(e) =>
                    setAboutField("values", i, "text", e.target.value)
                  }
                />
              </div>

              <IconButton
                variant="danger"
                onClick={() => removeAboutItem("values", i)}
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
        </div>
      </Card>

      {/* Board of Directors */}
      <Card
        title="About page — Board of Directors"
        description="Manage the Board of Directors displayed on the About page"
        action={
          <Button variant="secondary" onClick={addBoardMember}>
            <Plus size={16} /> Add member
          </Button>
        }
      >
        <div className="space-y-3">
          {(settings.about?.boardOfDirectors || []).map((member, i) => (
            <div key={i} className="space-y-3 bg-navy-50/50 p-3 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-800">
                    Board Member {i + 1}
                  </p>
                </div>

                <IconButton
                  variant="danger"
                  onClick={() => removeBoardMember(i)}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Name">
                  <Input
                    placeholder="e.g. Dilli Raj Khanal, Ph.D."
                    value={member.name || ""}
                    onChange={(e) => setBoardMember(i, "name", e.target.value)}
                  />
                </Field>

                <Field label="Position">
                  <Input
                    placeholder="e.g. Chairman"
                    value={member.position || ""}
                    onChange={(e) =>
                      setBoardMember(i, "position", e.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Photo">
                <ImageUpload
                  value={member.photoUrl || ""}
                  onChange={(url) => setBoardMember(i, "photoUrl", url)}
                  shape="square"
                />
              </Field>

              <Field label="Description" hint="Optional">
                <Textarea
                  rows={2}
                  placeholder="Optional description"
                  value={member.description || ""}
                  onChange={(e) =>
                    setBoardMember(i, "description", e.target.value)
                  }
                />
              </Field>

              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Display order">
                  <Input
                    type="number"
                    value={member.order ?? i + 1}
                    onChange={(e) =>
                      setBoardMember(i, "order", Number(e.target.value))
                    }
                  />
                </Field>

                <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
                  <input
                    type="checkbox"
                    checked={member.isActive !== false}
                    onChange={(e) =>
                      setBoardMember(i, "isActive", e.target.checked)
                    }
                    className="rounded text-marigold focus:ring-marigold"
                  />

                  <span className="text-sm text-navy-700">Show on website</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="About page — Leadership quote"
        description="The featured quote block on the About page"
      >
        <div className="space-y-4">
          <Field label="Quote">
            <Textarea
              rows={3}
              value={settings.about?.leadership?.text || ""}
              onChange={(e) => setLeadership("text", e.target.value)}
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Author name">
              <Input
                value={settings.about?.leadership?.author || ""}
                onChange={(e) => setLeadership("author", e.target.value)}
              />
            </Field>

            <Field label="Author role">
              <Input
                value={settings.about?.leadership?.role || ""}
                onChange={(e) => setLeadership("role", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card
        title="Quick stats"
        description="Shown as animated counters on the homepage"
        action={
          <Button variant="secondary" onClick={addStat}>
            <Plus size={16} /> Add stat
          </Button>
        }
      >
        <div className="space-y-2">
          {(settings.stats || []).map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px_36px] gap-2">
              <Input
                placeholder="Label"
                value={s.label}
                onChange={(e) => setStat(i, "label", e.target.value)}
              />

              <Input
                type="number"
                placeholder="Value"
                value={s.value}
                onChange={(e) => setStat(i, "value", Number(e.target.value))}
              />

              <Input
                placeholder="Suffix (+)"
                value={s.suffix}
                onChange={(e) => setStat(i, "suffix", e.target.value)}
              />

              <IconButton variant="danger" onClick={() => removeStat(i)}>
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Contact information">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Address">
            <Input
              value={settings.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>

          <Field label="Phone">
            <Input
              value={settings.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>

          <Field label="Email">
            <Input
              value={settings.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>

          <Field label="Office hours">
            <Input
              value={settings.officeHours}
              onChange={(e) => set("officeHours", e.target.value)}
            />
          </Field>

          <Field label="Google Maps embed URL" className="md:col-span-2">
            <Input
              value={settings.mapEmbedUrl}
              onChange={(e) => set("mapEmbedUrl", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Social media links"
        description="Update the Facebook, Instagram and other links shown in the footer"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label={
              <span className="flex items-center gap-1.5">
                <LinkIcon size={14} /> Facebook
              </span>
            }
          >
            <Input
              value={settings.socialLinks?.facebook || ""}
              onChange={(e) => setSocial("facebook", e.target.value)}
              placeholder="https://facebook.com/yourcollege"
            />
          </Field>

          <Field
            label={
              <span className="flex items-center gap-1.5">
                <LinkIcon size={14} /> Instagram
              </span>
            }
          >
            <Input
              value={settings.socialLinks?.instagram || ""}
              onChange={(e) => setSocial("instagram", e.target.value)}
            />
          </Field>

          <Field
            label={
              <span className="flex items-center gap-1.5">
                <LinkIcon size={14} /> YouTube
              </span>
            }
          >
            <Input
              value={settings.socialLinks?.youtube || ""}
              onChange={(e) => setSocial("youtube", e.target.value)}
            />
          </Field>

          <Field
            label={
              <span className="flex items-center gap-1.5">
                <LinkIcon size={14} /> LinkedIn
              </span>
            }
          >
            <Input
              value={settings.socialLinks?.linkedin || ""}
              onChange={(e) => setSocial("linkedin", e.target.value)}
            />
          </Field>

          <Field
            label={
              <span className="flex items-center gap-1.5">
                <LinkIcon size={14} /> Twitter / X
              </span>
            }
          >
            <Input
              value={settings.socialLinks?.twitter || ""}
              onChange={(e) => setSocial("twitter", e.target.value)}
            />
          </Field>

          <Field label="TikTok">
            <Input
              value={settings.socialLinks?.tiktok || ""}
              onChange={(e) => setSocial("tiktok", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Navbar Downloads"
        description="The navbar's Downloads dropdown (Model Questions, Past Questions, etc.) is now managed on its own page."
        action={
          <RouterLink to="/admin/downloads">
            <Button variant="secondary">
              <FileDown size={16} /> Manage Downloads
            </Button>
          </RouterLink>
        }
      >
        <p className="text-xs text-navy-400">
          Add, edit, or remove as many downloadable files as you like — each
          with its own title and category.
        </p>
      </Card>

      {/* Component Toggles Section */}
      <Card
        title="Component Toggles"
        description="Control the visibility of specific pages and sections across the site"
        action={
          <RouterLink to="/admin/visibility">
            <Button variant="secondary">
              <Eye size={16} /> Open full Visibility manager
            </Button>
          </RouterLink>
        }
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer p-2 bg-navy-50/50 dark:bg-navy-800/30 rounded-lg">
            <input
              type="checkbox"
              checked={settings.features?.blogDisabled || false}
              onChange={(e) => setFeature("blogDisabled", e.target.checked)}
              className="rounded text-marigold focus:ring-marigold"
            />

            <div>
              <span className="text-sm font-medium text-navy-800 dark:text-paper">
                Disable Blog Module
              </span>

              <p className="text-xs text-navy-500">
                When checked, hides the Blog link from the navbar and disables
                the blog section.
              </p>
            </div>
          </label>

          <p className="text-xs text-navy-400 px-2">
            For fine-grained control over every page and section (hero banners,
            timelines, individual blocks), use the{" "}
            <RouterLink
              to="/admin/visibility"
              className="text-marigold-600 font-semibold hover:underline"
            >
              Page &amp; Section Visibility
            </RouterLink>{" "}
            manager.
          </p>
        </div>
      </Card>

      <Card title="Announcement bar">
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.announcementBarEnabled}
              onChange={(e) => set("announcementBarEnabled", e.target.checked)}
            />

            <span className="text-sm text-navy-700">
              Show announcement bar at the top of the site
            </span>
          </label>

          <Field label="Announcement text">
            <Input
              value={settings.announcementBarText}
              onChange={(e) => set("announcementBarText", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card title="Footer">
        <Field label="Footer note">
          <Input
            value={settings.footerNote}
            onChange={(e) => set("footerNote", e.target.value)}
          />
        </Field>
      </Card>

      <p className="text-xs text-navy-400 px-2">
        To invite new admins/editors, change your password, or manage existing
        accounts, see{" "}
        <RouterLink
          to="/admin/users"
          className="text-marigold-600 font-semibold hover:underline"
        >
          User Management
        </RouterLink>
        .
      </p>

      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? "Saving…" : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}
