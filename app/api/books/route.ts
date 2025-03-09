import { getBooksByQuery } from "@/lib/mongo/books";
import { parseQueryString } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryString = url.search.slice(1);
    
    const filters = parseQueryString(queryString);
    
    const { books, error } = await getBooksByQuery(filters);
    
    if (error) {
      console.error('Error fetching books:', error);
      return NextResponse.json({ error }, { status: 500 });
    }
    
    return NextResponse.json(books);
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}