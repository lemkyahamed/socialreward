const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let replSet;

/**
 * Connect to the in-memory database using a Replica Set (required for transactions).
 */
module.exports.connect = async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger' }
  });
  const uri = replSet.getUri();

  await mongoose.connect(uri);
};

/**
 * Drop database, close the connection and stop the Replica Set.
 */
module.exports.closeDatabase = async () => {
  if (replSet) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await replSet.stop();
  }
};

/**
 * Remove all data for all db collections.
 */
module.exports.clearDatabase = async () => {
  if (mongoose.connection.readyState === 1) { // 1 = connected
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
};
