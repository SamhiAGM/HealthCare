import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
dotenv.config();

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    // Fallback to MongoMemoryServer if no explicit URI is provided
    if (!mongoUri) {
      console.log('No MONGODB_URI found. Starting MongoDB Memory Server...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`Memory Server started at ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    console.log(`Successfully connected to MongoDB: ${mongoUri}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
