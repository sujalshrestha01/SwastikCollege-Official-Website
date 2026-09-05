import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, default: "" },
    creditHours: { type: Number, default: 3 },
  },
  { _id: false },
);

const semesterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // Backward-compatible: plain string subjects are supported too.
    courses: [{ type: String }],

    // Subjects with name, code and credit hours.
    subjects: [subjectSchema],

    // Elective subjects for this semester.
    electives: [subjectSchema],

    // Full syllabus PDF for this semester.
    syllabusUrl: { type: String, default: "" },
  },
  { _id: false },
);

const courseSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    duration: { type: String, required: true },
    seats: { type: Number, required: true },
    description: { type: String, required: true },
    eligibility: [{ type: String }],
    semesters: [semesterSchema],
    syllabusUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Course", courseSchema);
