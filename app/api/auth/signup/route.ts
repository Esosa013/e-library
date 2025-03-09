import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; 
import clientPromise from '@lib/mongo'; 
import { User } from '@/types';
 
export async function POST(req: NextRequest) { 
  const body = await req.json();
  const { email, password, name, purchasedBooks, coins } = body; 
 
  if (!email || !password) { 
    return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 }); 
  } 
 
  try { 
    const client = await clientPromise; 
    const db = client.db("auth"); 
    const users = db.collection<User>("users"); 
 
    const existingUser = await users.findOne({ email }); 
    if (existingUser) { 
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 }); 
    } 
 
    const hashedPassword = await bcrypt.hash(password, 10); 
 
    await users.insertOne({ email, password: hashedPassword, name, purchasedBooks, coins }); 
 
    return NextResponse.json({ success: true, message: "User created" }, { status: 201 }); 
  } catch (error) { 
    console.error("Signup error:", error); 
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 }); 
  } 
}