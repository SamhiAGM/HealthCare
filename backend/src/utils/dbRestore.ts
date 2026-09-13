import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

export async function restoreDatabase() {
  try {
    const dbDumpPath = path.join(process.cwd(), '.data', 'db_dump.json');
    
    // Check if dump exists
    try {
      await fs.access(dbDumpPath);
    } catch {
      console.log('[DB] No local database dump found. Starting fresh.');
      return false; // Indicating no restore happened
    }

    const dumpData = await fs.readFile(dbDumpPath, 'utf-8');
    const dump: Record<string, any[]> = JSON.parse(dumpData);

    const collections = mongoose.connection.collections;
    let collectionsRestored = 0;

    for (const [collectionName, docs] of Object.entries(dump)) {
      if (collections[collectionName] && docs.length > 0) {
        // Convert string _id and ObjectId representations back to ObjectId if necessary
        // Mongoose generic driver insertMany handles raw objects fine, but some types might need conversion.
        // The memory server is empty at this point, so we just insert the raw JSON docs.
        try {
          await collections[collectionName].insertMany(docs);
          collectionsRestored++;
        } catch (insertErr) {
          console.error(`[DB] Failed to restore collection ${collectionName}:`, insertErr);
        }
      }
    }

    console.log(`[DB] Successfully restored ${collectionsRestored} collections from local dump.`);
    return true; // Indicating restore happened
  } catch (error) {
    console.error('[DB] Error restoring database:', error);
    return false;
  }
}
