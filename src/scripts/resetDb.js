const mongoose = require('mongoose');
require('dotenv').config();

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Drop each collection
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }

    // Drop all indexes
    const db = mongoose.connection.db;
    const collections2 = await db.listCollections().toArray();
    for (let collection of collections2) {
      await db.collection(collection.name).dropIndexes();
      console.log(`Dropped indexes for collection: ${collection.name}`);
    }

    console.log('Database reset complete');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();