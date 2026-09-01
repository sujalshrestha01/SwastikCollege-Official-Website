import mongoose from "mongoose";

// A list of faculty/institutional research publications — title, authors,
// an optional abstract, and the paper file (PDF or Word).
const publicationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    authors: { type: String, default: "" }, // free text, e.g. "R. Sharma, A. Rai"
    abstract: { type: String, default: "" },
    publishedYear: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Publication", publicationSchema);
