import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('CRITICAL: MONGODB_URI environment variable is not defined.');
    }

    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(mongoUri);
    console.log(`Successfully connected to MongoDB`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
