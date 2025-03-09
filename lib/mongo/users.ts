import { User } from "@/types";
import { ObjectId } from 'mongodb';
import clientPromise from '.';
import { MongoClient, Db, Collection, WithId } from 'mongodb';

let client: MongoClient | undefined;
let db: Db | undefined;
let users: Collection<WithId<Omit<User, '_id'>>>;

async function init(): Promise<void> {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db('auth');
    users = db.collection('users');
  } catch (error) {
    throw new Error('Failed to establish connection to database');
  }
}

export async function getUsersByQuery(
  query: Record<string, any> = {}
): Promise<{ users?: User[]; error?: string; }> {
  try {
    if (!users) await init();

    const queryObject: Record<string, any> = {};

    if (query._id) {
      queryObject._id = new ObjectId(query._id);
    }

    const result = await users.find(queryObject).toArray();
    return { users: result.map(user => ({ ...user, _id: user._id.toString() })) };
  } catch (error) {
    return { error: 'Failed to fetch users' };
  }
}

export async function updateUser(
  userId: string,
  update: Partial<Omit<User, '_id'>>
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!users) await init();

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: update }
    );

    return { success: result.modifiedCount === 1 };
  } catch (error) {
    return { error: 'Failed to update user' };
  }
}

export async function addCoins(
  userId: string,
  coinsToAdd: number
): Promise<{ success?: boolean; error?: string; newBalance?: number }> {
  try {
    if (!users) await init();

    // Find the user and update the coin balance
    const result = await users.findOne({ _id: new ObjectId(userId) });
    
    if (!result) {
      return { error: 'User not found' };
    }

    const newCoinBalance = (result.coins || 0) + coinsToAdd;

    const updateResult = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { coins: newCoinBalance } }
    );

    if (updateResult.modifiedCount === 1) {
      return { success: true, newBalance: newCoinBalance };
    } else {
      return { error: 'Failed to update coin balance' };
    }

  } catch (error) {
    return { error: 'Failed to add coins' };
  }
}