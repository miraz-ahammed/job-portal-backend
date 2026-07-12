import dotenv from "dotenv";
import connectDB from "../config/db";
import User from "../models/User";
import mongoose from "mongoose";

dotenv.config();

const seed = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@jobportal.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
  const adminName = process.env.ADMIN_NAME || "Admin User";

  const userEmail = process.env.DEMO_USER_EMAIL || "user@jobportal.com";
  const userPassword = process.env.DEMO_USER_PASSWORD || "User@1234";
  const userName = process.env.DEMO_USER_NAME || "Demo User";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({ name: adminName, email: adminEmail, password: adminPassword, role: "admin" });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("Admin already exists, skipping");
  }

  const existingUser = await User.findOne({ email: userEmail });
  if (!existingUser) {
    await User.create({ name: userName, email: userEmail, password: userPassword, role: "user" });
    console.log(`Demo user created: ${userEmail} / ${userPassword}`);
  } else {
    console.log("Demo user already exists, skipping");
  }

  await mongoose.disconnect();
  console.log("Seeding complete.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
