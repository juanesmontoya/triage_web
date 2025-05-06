import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

export const connectDB = async () => {
  try {

    await mongoose.connect(uri);
    console.log('MongoDB connected');

  } catch (error) {
    console.log(error);
    throw new Error(
        "[BD_ERROR] Connection with DB was impossible."
    );
  }
}