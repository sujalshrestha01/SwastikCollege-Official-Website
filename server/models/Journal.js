import mongoose from "mongoose";

// A list of published journal issues — similar shape to Downloads, one
// PDF/Word file per issue plus an issue number/year for display.
const journalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    issueNumber: { type: String, default: "" }, // e.g. "Vol. 3, Issue 1"
    publishedYear: { type: String, default: "" },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    coverImageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Journal", journalSchema);
