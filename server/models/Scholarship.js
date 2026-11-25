import mongoose from "mongoose";

// One published scholarship list, e.g. "BCA 2083 Batch". TU requires colleges
// to publish scholarship recipients on their website, so each list keeps an
// intro paragraph, an optional scan of TU's notice and the recipients.
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, trim: true, default: "" }, // entrance roll no.
    gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
  },
  { _id: false },
);

const scholarshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    program: { type: String, trim: true, default: "BCA" },
    batch: { type: String, trim: true, default: "" }, // e.g. "2083"
    description: { type: String, default: "" }, // intro text shown above the table
    date: { type: Date, default: Date.now },
    fileUrl: { type: String, default: "" }, // optional scan of the original TU notice
    students: { type: [studentSchema], default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Scholarship", scholarshipSchema);
