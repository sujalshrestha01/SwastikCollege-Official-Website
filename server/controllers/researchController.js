import AuthorGuideline from "../models/AuthorGuideline.js";
import CallForPaper from "../models/CallForPaper.js";
import Journal from "../models/Journal.js";
import {
  updateWithFileCleanup,
  deleteWithFileCleanup,
  deleteRemovedArrayFiles,
} from "../utils/fileCleanup.js";

/* ---------------------------- Author Guidelines --------------------------- */
// Singleton, same pattern as SiteSettings — one content page + attachments.

async function getOrCreateGuideline() {
  let doc = await AuthorGuideline.findOne({ key: "main" });
  if (!doc) doc = await AuthorGuideline.create({ key: "main" });
  return doc;
}

export async function getAuthorGuidelines(req, res) {
  try {
    const doc = await getOrCreateGuideline();
    res.json(doc);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch author guidelines", error: err.message });
  }
}

export async function updateAuthorGuidelines(req, res) {
  try {
    const existing = await getOrCreateGuideline();

    if (Array.isArray(req.body.files)) {
      await deleteRemovedArrayFiles(
        (existing.files || []).map((f) => f.fileUrl),
        req.body.files.map((f) => f.fileUrl),
      );
    }

    const updated = await AuthorGuideline.findOneAndUpdate(
      { key: "main" },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true },
    );
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update author guidelines", error: err.message });
  }
}

/* ------------------------------ Call for Paper ----------------------------- */

export async function listCallForPapers(req, res) {
  try {
    const items = await CallForPaper.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch call for papers", error: err.message });
  }
}

export async function getCallForPaper(req, res) {
  try {
    const item = await CallForPaper.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch item", error: err.message });
  }
}

export async function createCallForPaper(req, res) {
  try {
    const item = await CallForPaper.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to create item", error: err.message });
  }
}

export async function updateCallForPaper(req, res) {
  try {
    const item = await updateWithFileCleanup(
      CallForPaper,
      req.params.id,
      req.body,
      ["fileUrl"],
    );
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to update item", error: err.message });
  }
}

export async function deleteCallForPaper(req, res) {
  try {
    const item = await deleteWithFileCleanup(CallForPaper, req.params.id, [
      "fileUrl",
    ]);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
}

/* --------------------------------- Journals -------------------------------- */

export async function listJournals(req, res) {
  try {
    const items = await Journal.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch journals", error: err.message });
  }
}

export async function getJournal(req, res) {
  try {
    const item = await Journal.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch journal", error: err.message });
  }
}

export async function createJournal(req, res) {
  try {
    const item = await Journal.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to create journal", error: err.message });
  }
}

export async function updateJournal(req, res) {
  try {
    const item = await updateWithFileCleanup(Journal, req.params.id, req.body, [
      "fileUrl",
      "coverImageUrl",
    ]);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Failed to update journal", error: err.message });
  }
}

export async function deleteJournal(req, res) {
  try {
    const item = await deleteWithFileCleanup(Journal, req.params.id, [
      "fileUrl",
      "coverImageUrl",
    ]);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete journal", error: err.message });
  }
}
