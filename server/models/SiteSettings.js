import mongoose from "mongoose";

// Singleton document holding every "small detail" of the site the admin
// should be able to edit without touching code: identity, contact info,
// social links, homepage hero content, footer text, quick stats, and component toggles.
const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },

    collegeName: { type: String, default: "Swastik College" },
    collegeShortName: { type: String, default: "Swastik" },
    tagline: { type: String, default: "Shaping Careers, Building Futures" },
    logoUrl: { type: String, default: "" },
    establishedYear: { type: String, default: "2005" },
    affiliation: { type: String, default: "Tribhuvan University (TU)" },

    heroImages: [{ type: String }],
    heroHeadline: {
      type: String,
      default: "Shaping Careers, Building Futures",
    },
    heroSubheadline: {
      type: String,
      default:
        "A TU-affiliated college offering BSc. CSIT and BCA programs, built around small classes and real project experience.",
    },
    heroImageUrl: { type: String, default: "" },
    heroCtaText: { type: String, default: "Explore Programs" },
    heroCtaLink: { type: String, default: "/programs" },

    heroStatusLog: [
      {
        label: { type: String, default: "" },
        value: { type: String, default: "" },
      },
    ],
    whyChooseUs: [
      {
        icon: { type: String, default: "GraduationCap" },
        title: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    aboutSummary: { type: String, default: "" },
    missionStatement: { type: String, default: "" },
    visionStatement: { type: String, default: "" },

    address: { type: String, default: "Kathmandu, Nepal" },
    phone: { type: String, default: "+977-1-0000000" },
    email: { type: String, default: "info@swastikcollege.edu.np" },
    officeHours: { type: String, default: "Sun–Fri, 9:00 AM – 4:00 PM" },
    mapEmbedUrl: { type: String, default: "" },

    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },

    stats: [
      {
        label: { type: String, required: true },
        value: { type: Number, required: true },
        suffix: { type: String, default: "" },
      },
    ],

    footerNote: {
      type: String,
      default: "Affiliated to Tribhuvan University. All rights reserved.",
    },
    announcementBarText: { type: String, default: "" },
    announcementBarEnabled: { type: Boolean, default: false },

    // Component Visibility & Module Toggles Engine (legacy flat flags — kept for
    // backward compatibility with the /blog route guard in App.jsx).
    features: {
      blogDisabled: { type: Boolean, default: false }, // false = Blog Visible, true = Blog Hidden/Disabled
      galleryDisabled: { type: Boolean, default: false },
      heroStatusLogDisabled: { type: Boolean, default: false },
    },

    // Generic page + section visibility engine. Shape:
    // { <page>: { pageEnabled: Boolean, sections: { <sectionKey>: Boolean } } }
    // See server/controllers/settingsController.js VISIBILITY_SCHEMA for the
    // full catalogue of pages/sections and defaults.
    visibility: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Editable content blocks for the About page (was previously hardcoded).
    about: {
      timeline: {
        type: [
          {
            year: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, default: "" },
          },
        ],
        default: [
          {
            year: "2005",
            title: "The Foundation",
            description:
              "Established with a simple mission: providing accessible, world-class higher education to aspiring minds.",
          },
          {
            year: "2012",
            title: "University Affiliation",
            description:
              "Formally affiliated with Tribhuvan University, introducing nationally recognized degree programs.",
          },
          {
            year: "2018",
            title: "Campus & Infrastructure Expansion",
            description:
              "Built state-of-the-art computer labs, an extended digital library, and modern student research centers.",
          },
          {
            year: "Present Day",
            title: "Leading Academic Innovation",
            description:
              "A thriving community of over 2,000 students, industry-leading faculty, and strong global alumni networks.",
          },
        ],
      },
      values: {
        type: [
          {
            icon: { type: String, default: "GraduationCap" }, // lucide-react icon name, mapped client-side
            colorKey: { type: String, default: "blue" }, // 'blue' | 'emerald' | 'amber' | 'rose'
            title: { type: String, required: true },
            text: { type: String, default: "" },
          },
        ],
        default: [
          {
            icon: "GraduationCap",
            colorKey: "blue",
            title: "Academic Excellence",
            text: "Rigorous coursework matched with real-world project applications.",
          },
          {
            icon: "Users",
            colorKey: "emerald",
            title: "Expert Mentorship",
            text: "Learn directly from industry experts and seasoned academic professors.",
          },
          {
            icon: "Lightbulb",
            colorKey: "amber",
            title: "Innovation First",
            text: "Fostering research, creative problem solving, and technological skills.",
          },
          {
            icon: "HeartHandshake",
            colorKey: "rose",
            title: "Community & Ethics",
            text: "Building strong values, social responsibility, and lifelong connections.",
          },
        ],
      },
      leadership: {
        text: {
          type: String,
          default:
            "Education is not merely the accumulation of knowledge; it is the empowerment to create meaningful change in society. We nurture innovators, leaders, and ethical global citizens.",
        },
        author: { type: String, default: "Dr. Principal Name" },
        role: { type: String, default: "Campus Chief / Principal" },
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
