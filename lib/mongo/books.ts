import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import clientPromise from './index';
import { Book } from '@/types';

let client: MongoClient | undefined;
let db: Db | undefined;
let books: Collection<Book> | undefined;

async function init(): Promise<void> {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db('library');
    books = db.collection('book');
  } catch (error) {
    throw new Error('Failed to establish connection to database');
  }
}

export async function getAllBooks(): Promise<Book[]> {
  if (!books) await init();
  
  if (!books) {
    throw new Error('Database connection not initialized');
  }

  return books.find({}).toArray();
}

export async function getBookById(id: string): Promise<Book | null> {
  if (!books) await init();
  
  if (!books) {
    throw new Error('Database connection not initialized');
  }

  return books.findOne({ _id: new ObjectId(id) });
}

export async function getBooksByQuery(
  query: Record<string, any> = {}
): Promise<{
  books?: Book[];
  error?: string;
}> {
  try {
    if (!books) await init();

    if (!books) {
      throw new Error('Collection "books" is not initialized');
    }

    const queryObject: Record<string, any> = {};

    for (const [key, value] of Object.entries(query)) {
      if (key === '_id' && value) {
        queryObject[key] = new ObjectId(value);
      } else if (key === 'name' && value) {
        queryObject[key] = { $regex: value, $options: 'i' };
      } else if (value) {
        queryObject[key] = value;
      }
    }

    const result = await books.find(queryObject).toArray();

    return {
      books: result.map((book) => ({ ...book, _id: book._id.toString() })),
    };
  } catch (error) {
    return { error: 'Failed to fetch books' };
  }
}


export async function purchaseBook(userId: string, bookId: string, price: number): Promise<boolean> {
  await init();
  
  if (!client || !db) {
    throw new Error('Database connection not initialized');
  }

  const session = await client.startSession();
  const database = client.db('auth');
  
  try {
    await session.withTransaction(async () => {
      const usersCollection = database.collection('users');
      
      const updateResult = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $inc: { coins: -price },
          $addToSet: { purchasedBooks: new ObjectId(bookId) }
        }
      );

      if (updateResult.matchedCount === 0) {
        throw new Error('User not found');
      }
      
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.coins < 0) {
        throw new Error('Insufficient coins');
      }
    });
    
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('ObjectId')) {
      throw new Error('Invalid ID format');
    }
    throw error;
  } finally {
    await session.endSession();
  }
}