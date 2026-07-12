import { Router } from "express";
import {
  getJobs,
  getJobById,
  createJob,
  getMyJobs,
  deleteJob,
  getCategories,
  getJobStats,
} from "../controllers/jobController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

// IMPORTANT: specific routes must come before the "/:id" dynamic route
router.get("/meta/categories", getCategories);
router.get("/meta/stats", protect, adminOnly, getJobStats);
router.get("/manage/mine", protect, adminOnly, getMyJobs);

router.get("/", getJobs);
router.get("/:id", getJobById);
router.post("/", protect, adminOnly, createJob);
router.delete("/:id", protect, adminOnly, deleteJob);

export default router;
