import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import connectDB from "./config/db";

const app = express();
let isConnected = false;

const ensureDB = async (): Promise<void> => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", async (req, res, next) => {
  if (!isConnected) {
    try {
      await ensureDB();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }
  }
  next();
});

app.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Job Portal API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
