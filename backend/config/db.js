const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  await client.connect();
  const db = client.db('whatsapp');
  const collection = db.collection('processed_messages');
  await collection.createIndex({ msg_id: 1 }, { unique: true });
  return collection;
}

module.exports = connectDB;