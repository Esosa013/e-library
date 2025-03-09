import { getUsersByQuery } from "@/lib/mongo/users";
import { parseQueryString } from "@/utils/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryString = url.search.slice(1);
    console.log('Query string:', queryString);
    
    const filters = parseQueryString(queryString);
    console.log('Filters:', filters);
    
    const { users, error } = await getUsersByQuery(filters);
    
    if (error) {
      console.error('Error fetching books:', error);
      return NextResponse.json({ error }, { status: 500 });
    }
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}