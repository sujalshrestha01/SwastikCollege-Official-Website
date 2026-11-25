import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listScholarships,
  listAllScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from "../controllers/scholarshipsController.js";

const router = Router();

router.get("/", listScholarships);
router.get("/all", requireAuth, listAllScholarships);
router.post("/", requireAuth, createScholarship);
router.put("/:id", requireAuth, updateScholarship);
router.delete("/:id", requireAuth, deleteScholarship);

export default router;
