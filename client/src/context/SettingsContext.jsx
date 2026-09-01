import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getSettings } from "../api/client";

const defaultSettings = {
  collegeName: "Swastik College",
  collegeShortName: "Swastik",
  tagline: "Shaping Careers, Building Futures",
  establishedYear: "2005",
  affiliation: "Tribhuvan University (TU)",
  logoUrl: "",
  heroHeadline: "Shaping Careers, Building Futures",
  heroSubheadline:
    "A TU-affiliated college offering BSc. CSIT and BCA programs, built around small classes and real project experience.",
  heroImageUrl: "",
  heroImages: [],
  heroCtaText: "Explore Programs",
  heroCtaLink: "/programs",

  heroStatusLog: [
    { label: "college", value: "" }, // filled from collegeShortName at render if empty
    { label: "admissions", value: "open" },
    { label: "affiliation", value: "" }, // filled from affiliation at render if empty
    { label: "contact", value: "" }, // filled from phone at render if empty
  ],
  whyChooseUs: [
    {
      icon: "GraduationCap",
      title: "TU Affiliated Programs",
      description:
        "Offering industry-aligned BCA & B.Sc. CSIT degrees with standard 4-year, 8-semester curriculum excellence.",
    },
    {
      icon: "Users",
      title: "Industry Partnerships & 100% Placement",
      description:
        "Direct ties with top IT & Fintech giants like F1Soft and eSewa to provide internships, workshops, and career readiness.",
    },
    {
      icon: "Target",
      title: "Practical & Professional Training",
      description:
        "Beyond standard theory, students gain hands-on expertise through continuous lab work, bootcamps, and real projects.",
    },
    {
      icon: "HeartHandshake",
      title: "Experienced Faculty",
      description:
        "Guided by seasoned educators, tech leaders, and vibrant entrepreneurs dedicated to student mentorship.",
    },
  ],
  aboutSummary: "",
  missionStatement: "",
  visionStatement: "",
  address: "Kathmandu, Nepal",
  phone: "",
  email: "",
  officeHours: "",
  socialLinks: {},
  stats: [],
  footerNote: "All rights reserved.",
  announcementBarText: "",
  announcementBarEnabled: false,
  // Legacy flat toggles (kept for backward compatibility)
  features: {
    blogDisabled: false,
    galleryDisabled: false,
    heroStatusLogDisabled: false,
  },
  // Generic page + section visibility engine. Populated from the server, which
  // always merges saved values on top of the full page/section catalogue —
  // so every page/section defaults to visible even before an admin ever
  // touches the toggle screen.
  // Shape: { <page>: { pageEnabled: bool, sections: { <section>: bool } } }
  visibility: {},
  // Editable content for the About page (timeline, values, leadership quote)
  about: { timeline: [], values: [], leadership: null },
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refresh: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getSettings();
    if (data) {
      setSettings({
        ...defaultSettings,
        ...data,
        features: {
          ...defaultSettings.features,
          ...(data.features || {}),
        },
        visibility: {
          ...defaultSettings.visibility,
          ...(data.visibility || {}),
        },
        about: {
          ...defaultSettings.about,
          ...(data.about || {}),
        },
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Is an entire page enabled? Defaults to true if not yet configured.
  function isPageEnabled(page) {
    const p = settings.visibility?.[page];
    return p ? p.pageEnabled !== false : true;
  }

  // Is a specific section within a page enabled? Defaults to true.
  function isSectionVisible(page, section) {
    if (!isPageEnabled(page)) return false;
    const p = settings.visibility?.[page];
    if (!p || !p.sections || typeof p.sections[section] !== "boolean")
      return true;
    return p.sections[section];
  }

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refresh, isPageEnabled, isSectionVisible }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
