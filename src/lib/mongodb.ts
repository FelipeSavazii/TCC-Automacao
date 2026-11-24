import { MongoClient, type Db } from 'mongodb';

const globalForMongo = globalThis as unknown as {
  __lifeMongoClientPromise?: Promise<MongoClient>;
  __lifeMongoIndexesReady?: boolean;
};

export async function getMongoDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      'MONGODB_URI não está configurado. Defina MONGODB_URI no arquivo .env.local.'
    );
  }

  if (!globalForMongo.__lifeMongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    globalForMongo.__lifeMongoClientPromise = client.connect().catch((err) => {
      globalForMongo.__lifeMongoClientPromise = undefined;
      throw err;
    });
  }

  const client = await globalForMongo.__lifeMongoClientPromise;
  const dbName = process.env.MONGODB_DB?.trim() || 'life';
  const db = client.db(dbName);

  if (!globalForMongo.__lifeMongoIndexesReady) {
    globalForMongo.__lifeMongoIndexesReady = true;
    await Promise.all([
      db.collection('users').createIndex({ ht: 1 }, { unique: true }),
      db.collection('users').createIndex({ id: 1 }, { unique: true }),
      db.collection('avisos').createIndex({ id: 1 }, { unique: true }),
      db.collection('avisos').createIndex({ turma: 1, ativo: 1, urgente: -1, createdAt: -1 }),
    ]).catch(() => {
      globalForMongo.__lifeMongoIndexesReady = false;
    });
  }

  return db;
}
