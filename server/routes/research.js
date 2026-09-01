import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAuthorGuidelines,
  updateAuthorGuidelines,
  listCallForPapers,
  getCallForPaper,
  createCallForPaper,
  updateCallForPaper,
  deleteCallForPaper,
  listJournals,
  getJournal,
  createJournal,
  updateJournal,
  deleteJournal,
} from "../controllers/researchController.js";

const router = Router();

// Author Guidelines — singleton
router.get("/author-guidelines", getAuthorGuidelines);
router.put("/author-guidelines", requireAuth, updateAuthorGuidelines);

// Call for Paper — list
router.get("/call-for-papers", listCallForPapers);
router.get("/call-for-papers/:id", getCallForPaper);
router.post("/call-for-papers", requireAuth, createCallForPaper);
router.put("/call-for-papers/:id", requireAuth, updateCallForPaper);
router.delete("/call-for-papers/:id", requireAuth, deleteCallForPaper);

// Journals — list
router.get("/journals", listJournals);
router.get("/journals/:id", getJournal);
router.post("/journals", requireAuth, createJournal);
router.put("/journals/:id", requireAuth, updateJournal);
router.delete("/journals/:id", requireAuth, deleteJournal);

export default router;
