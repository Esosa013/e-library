import { MongoClient, ObjectId, WithId } from 'mongodb';
import { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters';

interface UserDocument {
  _id: ObjectId;
  email: string;
  emailVerified: Date | null;
  image?: string | null;
  name?: string | null;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountDocument {
  _id: ObjectId;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

interface SessionDocument {
  _id: ObjectId;
  userId: string;
  expires: Date;
  sessionToken: string;
}

interface VerificationTokenDocument {
  _id: ObjectId;
  identifier: string;
  token: string;
  expires: Date;
}

export default function MongoDBAdapter(client: MongoClient): Adapter {
  const db = client.db();
  const usersCollection = db.collection<UserDocument>('users');
  const accountsCollection = db.collection<AccountDocument>('accounts');
  const sessionsCollection = db.collection<SessionDocument>('sessions');
  const verificationTokensCollection = db.collection<VerificationTokenDocument>('verification_tokens');

  return {
    async createUser(user: Omit<AdapterUser, 'id'>): Promise<AdapterUser> {
      const { email, emailVerified, image, name } = user;

      const newUser: Omit<UserDocument, '_id'> = {
        email,
        emailVerified,
        image: image ?? null,
        name: name ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser as UserDocument);
      const createdUser = await usersCollection.findOne({ _id: result.insertedId });

      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      return {
        id: createdUser._id.toString(),
        email: createdUser.email,
        emailVerified: createdUser.emailVerified,
        image: createdUser.image ?? null,
        name: createdUser.name ?? null,
      };
    },

    async getUser(id: string): Promise<AdapterUser | null> {
      try {
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        
        if (!user) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image ?? null,
          name: user.name ?? null,
        };
      } catch (error) {
        return null;
      }
    },

    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const user = await usersCollection.findOne({ email });
      
      if (!user) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image ?? null,
        name: user.name ?? null,
      };
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }): Promise<AdapterUser | null> {
      const account = await accountsCollection.findOne({ providerAccountId, provider });
      
      if (!account) return null;

      const user = await usersCollection.findOne({ _id: new ObjectId(account.userId) });
      
      if (!user) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image ?? null,
        name: user.name ?? null,
      };
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }): Promise<AdapterUser> {
      const { id, ...updateData } = user;
      
      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
        { 
          returnDocument: 'after',
          includeResultMetadata: true 
        }
      );

      if (!result || !('document' in result)) {
        throw new Error('Failed to update user');
      }

      const updatedUser = result.document as WithId<UserDocument>;

      return {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        image: updatedUser.image ?? null,
        name: updatedUser.name ?? null,
      };
    },

    async deleteUser(userId: string): Promise<void> {
      const userObjectId = new ObjectId(userId);
      await Promise.all([
        usersCollection.deleteOne({ _id: userObjectId }),
        accountsCollection.deleteMany({ userId }),
        sessionsCollection.deleteMany({ userId }),
      ]);
    },

    async linkAccount(account: AdapterAccount): Promise<void> {
      const newAccount: Omit<AccountDocument, '_id'> = {
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      };

      await accountsCollection.insertOne(newAccount as AccountDocument);
    },

    async unlinkAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }): Promise<void> {
      await accountsCollection.deleteOne({ providerAccountId, provider });
    },

    async createSession({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
      const newSession: Omit<SessionDocument, '_id'> = {
        sessionToken,
        userId,
        expires,
      };

      await sessionsCollection.insertOne(newSession as SessionDocument);

      return {
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      const session = await sessionsCollection.findOne({ sessionToken });
      
      if (!session) return null;

      const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
      
      if (!user) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: user._id.toString(),
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image ?? null,
          name: user.name ?? null,
        },
      };
    },

    async updateSession({ sessionToken }: { sessionToken: string; expires?: Date }): Promise<AdapterSession | null> {
      const session = await sessionsCollection.findOne({ sessionToken });
      if (!session) return null;
      
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      };
    },

    async deleteSession(sessionToken: string): Promise<void> {
      await sessionsCollection.deleteOne({ sessionToken });
    },

    async createVerificationToken({ identifier, expires, token }: VerificationToken): Promise<VerificationToken> {
      const newToken: Omit<VerificationTokenDocument, '_id'> = {
        identifier,
        token,
        expires,
      };

      await verificationTokensCollection.insertOne(newToken as VerificationTokenDocument);

      return {
        identifier,
        token,
        expires,
      };
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }): Promise<VerificationToken | null> {
      const result = await verificationTokensCollection.findOneAndDelete({
        identifier,
        token,
        expires: { $gt: new Date() },
      });

      if (!result || !('document' in result)) return null;

      const { _id, ...verificationToken } = result.document as WithId<VerificationTokenDocument>;
      return {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      };
    },
  };
}