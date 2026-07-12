import mongoose, { Document, Schema, Types } from "mongoose";

export type JobType = "Full-time" | "Part-time" | "Remote" | "Contract" | "Internship";

export interface IJob extends Document {
  title: string;
  companyName: string;
  companyLogo?: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  jobType: JobType;
  location: string;
  minSalary: number;
  maxSalary: number;
  deadline: Date;
  postedBy: Types.ObjectId;
  createdAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: 200,
    },
    fullDescription: {
      type: String,
      required: [true, "Full description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Remote", "Contract", "Internship"],
      required: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    minSalary: {
      type: Number,
      required: true,
    },
    maxSalary: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Useful indexes for search/filter/sort
jobSchema.index({ title: "text", companyName: "text", category: "text" });
jobSchema.index({ category: 1, location: 1 });

export default mongoose.model<IJob>("Job", jobSchema);
