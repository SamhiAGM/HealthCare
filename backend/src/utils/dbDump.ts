import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

export async function dumpDatabase() {
  try {
    const dataDir = path.join(__dirname, '..', '..', '.data');
    await fs.mkdir(dataDir, { recursive: true });
    
    const dbDumpPath = path.join(dataDir, 'db_dump.json');
    const dump: Record<string, any[]> = {};

    const collections = mongoose.connection.collections;
    for (const [collectionName, collection] of Object.entries(collections)) {
      const docs = await collection.find({}).toArray();
      dump[collectionName] = docs;
    }

    await fs.writeFile(dbDumpPath, JSON.stringify(dump, null, 2), 'utf-8');
    console.log(`[DB] Database successfully dumped to ${dbDumpPath}`);
  } catch (error) {
    console.error('[DB] Error dumping database:', error);
  }
}
