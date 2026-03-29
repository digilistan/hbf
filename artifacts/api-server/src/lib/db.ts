import mongoose from "mongoose";
import { logger } from "./logger.js";

const MONGO_URI = process.env["MONGO_URI"];

if (!MONGO_URI) {
  throw new Error("MONGO_URI environment variable is required");
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI as string);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    throw err;
  }
}
