import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();

import app from "../src/server";
import connectDB from "../src/config/db";

let isConnected = false;

const ensureDB = async () => {
  if (isConnected) return;
  try {
    await connectDB();
    isConnected = true;
  } catch (err) {
    console.error("DB connection failed in serverless function:", err);
  }
};

// Connect once per cold start
ensureDB();

export default serverless(app);
