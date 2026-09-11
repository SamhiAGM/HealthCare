import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../../backend/src/app';
import { connectDB } from '../../../backend/src/db';

// Ensure the Express app knows it's behind a proxy
app.set('trust proxy', true);

// Body parsing is handled by Express, so we disable Next.js body parsing
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

let dbConnected = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Connect to the database if not already connected
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  
  // Forward the request to the Express application
  return app(req, res);
}
