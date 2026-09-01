import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listQaaDocuments,
  getQaaDocument,
  createQaaDocument,
  updateQaaDocument,
  deleteQaaDocument,
  verifyQaaDocument,
} from "../controllers/qaaController.js";

const router = Router();

router.get("/", requireAuth, listQaaDocuments);
router.get("/:id", requireAuth, getQaaDocument);
router.post("/", requireAuth, createQaaDocument);
router.put("/:id", requireAuth, updateQaaDocument);
router.patch("/:id/verify", requireAuth, verifyQaaDocument);
router.delete("/:id", requireAuth, deleteQaaDocument);

export default router;
