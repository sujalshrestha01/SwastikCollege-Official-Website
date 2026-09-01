import mongoose from "mongoose";

// Quality Assurance & Accreditation documents (self-study reports,
// accreditation certificates, committee minutes, etc). Regular admins/editors
// upload and manage these like any other content. A separate, narrowly-scoped
// "qaaVerifier" account (see Admin.js) can additionally flip `status` to
// "verified" once they've checked a document — that's the only thing that
// role is allowed to do (enforced in qaaController.js + restrictQaaVerifier.js).
const qaaDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileType: {
      type: String,
      enum: ["pdf", "doc", "docx"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
    // Snapshot of who verified it and when — kept even if that verifier
    // account is later removed, since it's part of the audit trail.
    verifiedBy: { type: String, default: "" },
    verifiedAt: { type: Date, default: null },
    order: { type: Number, default: 0 }, // lower shows first
  },
  { timestamps: true },
);

export default mongoose.model("QaaDocument", qaaDocumentSchema);
