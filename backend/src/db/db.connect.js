import mongoose from "mongoose";

export const initializeDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("Database connected");
  } catch (error) {
    console.log("Failed to connect to MongoDB", error);
  }
};
