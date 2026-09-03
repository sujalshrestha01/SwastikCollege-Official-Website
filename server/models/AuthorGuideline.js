import mongoose from "mongoose";

// Singleton document (same pattern as SiteSettings) — one static content
// page edited via the rich text editor, plus optional downloadable
// templates/checklists (PDF or Word) for authors to grab.

const authorGuidelineSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    content: { type: String, default: "" }, // rich text HTML from RichEditor
    files: [
      {
        name: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("AuthorGuideline", authorGuidelineSchema);
