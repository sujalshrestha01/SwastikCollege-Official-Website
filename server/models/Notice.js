import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Exams", "Admissions", "Scholarships", "Events", "General"],
    },
    date: { type: Date, required: true, default: Date.now },
    excerpt: { type: String, required: true },
    fileUrl: { type: String, default: "" },
    // Optional related page, e.g. "/scholarships" — shown as a "View details" link.
    linkUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Notice", noticeSchema);
