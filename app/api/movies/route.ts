import { NextResponse, NextRequest } from 'next/server';
import { getMoviesByQuery, addMovie } from '@/lib/mongo/movies';
import { parseQueryString } from '@utils/utils';

export async function GET(req: NextRequest) {
  try {
    const queryString = req.url.split('?')[1] || '';

    const filters = parseQueryString(queryString);

    const { movies, error } = await getMoviesByQuery(filters);

    if (error) {
      console.error('Error fetching movies:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(movies);
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const movie = await req.json();
    console.log('Received movie data:', movie);

    const result = await addMovie(movie);
    console.log('addMovie result:', result);

    if (result.error) {
      console.error('Error from addMovie:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ movie: result.movie }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/movies:', error);
    return NextResponse.json(
      { error: `Failed to add movie: ${error.message}` },
      { status: 500 }
    );
  }
}
