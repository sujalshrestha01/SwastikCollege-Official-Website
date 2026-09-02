import mongoose from "mongoose";

// A list of research call-for-paper announcements — similar shape to
// Notices, but with a submission deadline and an open/closed status.
const callForPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" }, // rich text HTML from RichEditor
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    fileUrl: { type: String, default: "" }, // optional attached PDF/Word notice
    files: [
      {
        name: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
      },
    ], // optional downloadable templates/checklists for this call
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("CallForPaper", callForPaperSchema);
