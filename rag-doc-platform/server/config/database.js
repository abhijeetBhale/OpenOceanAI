import mongoose from "mongoose";

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  const mongoURL = process.env.MONGO_URL;

  if (!mongoURL) {
    console.warn(
      "MongoDB disabled: MONGO_URL is not set. Starting without database features.",
    );
    return false;
  }

  try {
    await mongoose.connect(mongoURL);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
