import { Response } from "express";
import Job from "../models/Job";
import { AuthRequest } from "../middleware/authMiddleware";

// @route  GET /api/jobs
// Supports: ?search=&category=&location=&jobType=&sort=&page=&limit=
export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      location,
      jobType,
      sort = "newest",
      page = "1",
      limit = "12",
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (jobType) {
      query.jobType = jobType;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "salary-high") sortOption = { maxSalary: -1 };
    if (sort === "salary-low") sortOption = { minSalary: 1 };
    if (sort === "deadline") sortOption = { deadline: 1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sortOption).skip(skip).limit(limitNum).populate("postedBy", "name email"),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch jobs", error: (error as Error).message });
  }
};

// @route  GET /api/jobs/:id
export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    const relatedJobs = await Job.find({
      _id: { $ne: job._id },
      category: job.category,
    }).limit(4);

    res.status(200).json({ success: true, job, relatedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch job", error: (error as Error).message });
  }
};

// @route  POST /api/jobs  (admin only)
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      companyName,
      companyLogo,
      shortDescription,
      fullDescription,
      category,
      jobType,
      location,
      minSalary,
      maxSalary,
      deadline,
    } = req.body;

    if (!title || !companyName || !shortDescription || !fullDescription || !category || !jobType || !location || !deadline) {
      res.status(400).json({ success: false, message: "Please fill in all required fields" });
      return;
    }

    const job = await Job.create({
      title,
      companyName,
      companyLogo,
      shortDescription,
      fullDescription,
      category,
      jobType,
      location,
      minSalary,
      maxSalary,
      deadline,
      postedBy: req.user!._id,
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create job", error: (error as Error).message });
  }
};

// @route  GET /api/jobs/manage/mine  (admin only - jobs posted by logged-in admin)
export const getMyJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find({ postedBy: req.user!._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch your jobs", error: (error as Error).message });
  }
};

// @route  DELETE /api/jobs/:id  (admin only, must be owner)
export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    if (job.postedBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, message: "You can only delete jobs you posted" });
      return;
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete job", error: (error as Error).message });
  }
};

// @route  GET /api/jobs/meta/categories  (for filter dropdown)
export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Job.distinct("category");
    const locations = await Job.distinct("location");
    res.status(200).json({ success: true, categories, locations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch metadata", error: (error as Error).message });
  }
};

// @route  GET /api/jobs/meta/stats  (admin only - chart data for Manage Jobs dashboard)
export const getJobStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user!._id;

    const byCategory = await Job.aggregate([
      { $match: { postedBy: ownerId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byType = await Job.aggregate([
      { $match: { postedBy: ownerId } },
      { $group: { _id: "$jobType", count: { $sum: 1 } } },
    ]);

    const byMonth = await Job.aggregate([
      { $match: { postedBy: ownerId } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    res.status(200).json({
      success: true,
      byCategory: byCategory.map((c) => ({ name: c._id, count: c.count })),
      byType: byType.map((t) => ({ name: t._id, count: t.count })),
      byMonth: byMonth.map((m) => ({
        name: `${monthNames[m._id.month - 1]} ${m._id.year}`,
        count: m.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats", error: (error as Error).message });
  }
};
