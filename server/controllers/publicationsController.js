import Publication from "../models/Publication.js";
import {
  updateWithFileCleanup,
  deleteWithFileCleanup,
} from "../utils/fileCleanup.js";

export async function listPublications(req, res) {
  try {
    const items = await Publication.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch publications", error: err.message });
  }
}

export async function getPublication(req, res) {
  try {
    const item = await Publication.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Publication not found" });
    res.json(item);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch publication", error: err.message });
  }
}

export async function createPublication(req, res) {
  try {
    const item = await Publication.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create publication", error: err.message });
  }
}

export async function updatePublication(req, res) {
  try {
    const item = await updateWithFileCleanup(
      Publication,
      req.params.id,
      req.body,
      ["fileUrl"],
    );
    if (!item) return res.status(404).json({ message: "Publication not found" });
    res.json(item);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update publication", error: err.message });
  }
}

export async function deletePublication(req, res) {
  try {
    const item = await deleteWithFileCleanup(Publication, req.params.id, [
      "fileUrl",
    ]);
    if (!item) return res.status(404).json({ message: "Publication not found" });
    res.json({ message: "Publication deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete publication", error: err.message });
  }
}
