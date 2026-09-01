import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listPublications,
  getPublication,
  createPublication,
  updatePublication,
  deletePublication,
} from "../controllers/publicationsController.js";

const router = Router();

router.get("/", listPublications);
router.get("/:id", getPublication);
router.post("/", requireAuth, createPublication);
router.put("/:id", requireAuth, updatePublication);
router.delete("/:id", requireAuth, deletePublication);

export default router;
