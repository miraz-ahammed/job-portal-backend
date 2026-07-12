import serverless from "serverless-http";
import dotenv from "dotenv";
dotenv.config();

import app from "../src/server";
import connectDB from "../src/config/db";

let isConnected = false;

const ensureDB = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

export default serverless(app);
