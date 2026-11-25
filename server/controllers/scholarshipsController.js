import Scholarship from "../models/Scholarship.js";
import {
  updateWithFileCleanup,
  deleteWithFileCleanup,
} from "../utils/fileCleanup.js";

// Public: only published lists, newest first.
export async function listScholarships(req, res) {
  try {
    const items = await Scholarship.find({ published: true }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch scholarships", error: err.message });
  }
}

// Admin: every list, including unpublished drafts.
export async function listAllScholarships(req, res) {
  try {
    const items = await Scholarship.find().sort({ date: -1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch scholarships", error: err.message });
  }
}

export async function createScholarship(req, res) {
  try {
    const item = await Scholarship.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create scholarship list", error: err.message });
  }
}

export async function updateScholarship(req, res) {
  try {
    const item = await updateWithFileCleanup(
      Scholarship,
      req.params.id,
      req.body,
      ["fileUrl"],
    );
    if (!item)
      return res.status(404).json({ message: "Scholarship list not found" });
    res.json(item);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update scholarship list", error: err.message });
  }
}

export async function deleteScholarship(req, res) {
  try {
    const item = await deleteWithFileCleanup(Scholarship, req.params.id, [
      "fileUrl",
    ]);
    if (!item)
      return res.status(404).json({ message: "Scholarship list not found" });
    res.json({ message: "Scholarship list deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete scholarship list", error: err.message });
  }
}
