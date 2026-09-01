import QaaDocument from "../models/QaaDocument.js";
import {
  updateWithFileCleanup,
  deleteWithFileCleanup,
} from "../utils/fileCleanup.js";

// Anything that adds, edits, or removes a document is restricted to regular
// admins/editors — a qaaVerifier account must never be able to touch content,
// only view it and call verifyQaaDocument below. This is a second layer on
// top of the global route-prefix block in restrictQaaVerifier.js, since that
// middleware necessarily allows every /api/qaa/* request through.
function blockVerifierWrite(req, res) {
  if (req.admin.role === "qaaVerifier") {
    res
      .status(403)
      .json({ message: "This account can only view and verify documents." });
    return true;
  }
  return false;
}

export async function listQaaDocuments(req, res) {
  try {
    const docs = await QaaDocument.find().sort({ order: 1, createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch QAA documents", error: err.message });
  }
}

export async function getQaaDocument(req, res) {
  try {
    const doc = await QaaDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch document", error: err.message });
  }
}

export async function createQaaDocument(req, res) {
  try {
    if (blockVerifierWrite(req, res)) return;
    const doc = await QaaDocument.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create document", error: err.message });
  }
}

export async function updateQaaDocument(req, res) {
  try {
    if (blockVerifierWrite(req, res)) return;
    const doc = await updateWithFileCleanup(
      QaaDocument,
      req.params.id,
      req.body,
      ["fileUrl"],
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update document", error: err.message });
  }
}

export async function deleteQaaDocument(req, res) {
  try {
    if (blockVerifierWrite(req, res)) return;
    const doc = await deleteWithFileCleanup(QaaDocument, req.params.id, [
      "fileUrl",
    ]);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete document", error: err.message });
  }
}

// PATCH /api/qaa/:id/verify — the one write action a qaaVerifier account
// IS allowed to take. Also usable by superadmin/editor (e.g. to un-verify
// or to verify on the external reviewer's behalf).
export async function verifyQaaDocument(req, res) {
  try {
    const { status } = req.body; // "pending" | "verified"
    if (!["pending", "verified"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'pending' or 'verified'" });
    }

    const doc = await QaaDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.status = status;
    doc.verifiedBy = status === "verified" ? req.admin.name : "";
    doc.verifiedAt = status === "verified" ? new Date() : null;
    await doc.save();

    res.json(doc);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update verification status", error: err.message });
  }
}
