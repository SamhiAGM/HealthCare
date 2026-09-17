import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let mongoServer: any = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('CRITICAL: MONGODB_URI environment variable is not defined.');
    }

    if (mongoose.connection.readyState >= 1) {
      return;
    }

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`Successfully connected to MongoDB`);
    } catch (e) {
      console.log('Failed to connect to primary MongoDB, falling back to in-memory server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`Successfully connected to in-memory MongoDB`);
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
