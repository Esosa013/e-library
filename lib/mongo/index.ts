import { MongoClient } from 'mongodb';

const URI = process.env.MONGODB_URI as string;
const options = {};

if (!URI) throw new Error('Please add your Mongo URI to .env.local');

let client: MongoClient = new MongoClient(URI, options);
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV !== 'production') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
}
else {
  clientPromise = client.connect();
}

export default clientPromise;
