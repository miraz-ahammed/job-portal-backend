import mongoose from "mongoose";

let isConnected = false;

const connectDB = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    mongoose.set("bufferCommands", false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return mongoose;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDB;