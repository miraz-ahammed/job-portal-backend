import dotenv from "dotenv";
dotenv.config();

import app from "../src/server";
import connectDB from "../src/config/db";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error("DB connection failed:", err);
      res.status(500).json({ success: false, message: "Database connection failed" });
      return;
    }
  }
  return app(req, res);
}