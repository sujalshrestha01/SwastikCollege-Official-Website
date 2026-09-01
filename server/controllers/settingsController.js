import SiteSettings from "../models/SiteSettings.js";
import { deleteUploadedFile } from "../utils/cloudinaryHelpers.js";
import { deleteRemovedArrayFiles } from "../utils/fileCleanup.js";

// The full catalogue of pages + toggleable sections inside each page.
// This drives BOTH the admin "Page & Section Visibility" screen and acts as
// the fallback default so any page/section not yet saved in the DB still
// shows up as "visible" by default.
//
// Shape saved on SiteSettings.visibility:
// {
//   home: { pageEnabled: true, sections: { hero: true, notices: true, ... } },
//   about: { pageEnabled: true, sections: { hero: true, journey: false, ... } },
//   ...
// }
export const VISIBILITY_SCHEMA = {
  home: {
    label: "Home",
    sections: {
      hero: "Hero Banner",
      heroStatusLog: "Hero Status Log Card",
      quickAccess: "Quick Access Cards",
      whyChooseUs: "Why Choose Us",
      programsOverview: "Programs Overview",
      swastikExperience: "The Swastik Experience",
      eventCountdown: "Event Countdown",
      newsEvents: "News & Events",
      upcomingEvents: "Upcoming Events",
      takeATour: "Take a Tour",
      placementPartners: "Placement Partners",
      sisterInstitutes: "Sister Institutes",
      blog: "Latest from the Blog",
    },
  },
  about: {
    label: "About Us",
    sections: {
      hero: "Page Hero",
      journey: "Our Journey",
      missionVision: "Mission & Vision",
      values: "Core Values",
      leadership: "Leadership Message",
      stats: "Stats Strip",
    },
  },
  programs: {
    label: "Programs",
    sections: {
      hero: "Page Hero",
      list: "Programs List",
      nonCredit: "Non-Credit Courses Banner",
    },
  },
  faculty: {
    label: "Faculty",
    sections: {
      hero: "Page Hero",
      grid: "Faculty Grid",
    },
  },
  gallery: {
    label: "Gallery",
    sections: {
      hero: "Page Hero",
      grid: "Gallery Grid",
    },
  },
  blog: {
    label: "Blog",
    sections: {
      hero: "Page Hero",
      list: "Blog List",
    },
  },
  notices: {
    label: "Notice Board",
    sections: {
      hero: "Page Hero",
      list: "Notices List",
    },
  },
  downloads: {
    label: "Downloads",
    sections: {
      hero: "Page Hero",
      list: "Downloads List",
    },
  },
  research: {
    label: "Research",
    sections: {
      authorGuidelines: "Author Guidelines",
      callForPapers: "Call for Paper",
      journals: "Journals",
    },
  },
  qaa: {
    label: "Quality Assurance & Accreditation (QAA)",
    sections: {
      hero: "Page Content (Reviewer Login Gate)",
    },
  },
  publications: {
    label: "Publications",
    sections: {
      hero: "Page Hero",
      list: "Publications List",
    },
  },
  contact: {
    label: "Contact",
    sections: {
      hero: "Page Hero",
      form: "Inquiry Form",
      map: "Map",
    },
  },
  global: {
    label: "Global / Site-wide",
    sections: {
      navbar: "Navbar",
      footer: "Footer",
      floatingQuickAction: "Floating Quick Action Button",
      announcementBar: "Announcement Bar",
    },
  },
};

async function getOrCreateSettings() {
  let settings = await SiteSettings.findOne({ key: "main" });
  if (!settings) settings = await SiteSettings.create({ key: "main" });
  return settings;
}

// Merge saved visibility over the schema defaults (everything defaults to visible).
function withVisibilityDefaults(saved = {}) {
  const merged = {};
  for (const [pageKey, pageDef] of Object.entries(VISIBILITY_SCHEMA)) {
    const savedPage = saved[pageKey] || {};
    const sections = {};
    for (const sectionKey of Object.keys(pageDef.sections)) {
      sections[sectionKey] =
        savedPage.sections &&
        typeof savedPage.sections[sectionKey] === "boolean"
          ? savedPage.sections[sectionKey]
          : true;
    }
    merged[pageKey] = {
      pageEnabled:
        typeof savedPage.pageEnabled === "boolean"
          ? savedPage.pageEnabled
          : true,
      sections,
    };
  }
  return merged;
}

// GET /api/settings — public
export async function getSettings(req, res) {
  try {
    const settings = await getOrCreateSettings();
    const json = settings.toObject();
    json.visibility = withVisibilityDefaults(json.visibility);
    res.json(json);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch settings", error: err.message });
  }
}

// GET /api/settings/visibility-schema — admin only, describes all toggleable pages/sections
export function getVisibilitySchema(req, res) {
  res.json(VISIBILITY_SCHEMA);
}

// PUT /api/settings — admin only
// PUT /api/settings — admin only
export async function updateSettings(req, res) {
  try {
    const existing = await getOrCreateSettings();

    // Single-file fields: if replaced or cleared, delete the old file.
    for (const field of ["logoUrl", "heroImageUrl"]) {
      if (
        field in req.body &&
        req.body[field] !== existing[field] &&
        existing[field]
      ) {
        await deleteUploadedFile(existing[field]);
      }
    }
    // heroImages is a full array replaced on each save — same diffing as Gallery.
    if (Array.isArray(req.body.heroImages)) {
      await deleteRemovedArrayFiles(
        existing.heroImages || [],
        req.body.heroImages,
      );
    }

    const updatedSettings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true },
    );
    const json = updatedSettings.toObject();
    json.visibility = withVisibilityDefaults(json.visibility);
    res.json(json);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update settings", error: err.message });
  }
}

// PUT /api/settings/visibility — admin only, dedicated endpoint for the toggle screen
export async function updateVisibility(req, res) {
  try {
    const { visibility } = req.body;
    if (!visibility || typeof visibility !== "object") {
      return res.status(400).json({ message: "visibility object is required" });
    }
    const settings = await getOrCreateSettings();
    const current = settings.visibility || {};

    // Shallow-merge per page so a partial update from one toggle doesn't wipe others.
    const next = { ...current };
    for (const [pageKey, pageVal] of Object.entries(visibility)) {
      next[pageKey] = {
        pageEnabled:
          typeof pageVal.pageEnabled === "boolean"
            ? pageVal.pageEnabled
            : (next[pageKey]?.pageEnabled ?? true),
        sections: {
          ...(next[pageKey]?.sections || {}),
          ...(pageVal.sections || {}),
        },
      };
    }

    settings.visibility = next;
    settings.markModified("visibility");
    await settings.save();

    const json = settings.toObject();
    json.visibility = withVisibilityDefaults(json.visibility);
    res.json(json);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update visibility", error: err.message });
  }
}
