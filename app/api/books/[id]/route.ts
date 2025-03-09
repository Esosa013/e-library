import { NextResponse } from 'next/server';
import { getBookById } from '@/lib/mongo/books';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const book = await getBookById(params.id);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}