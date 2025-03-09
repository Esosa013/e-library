import { NextResponse, NextRequest } from 'next/server';
import { getMovieById, updateMovie, deleteMovie } from '@/lib/mongo/movies';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { movie, error } = await getMovieById(params.id);
    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json(movie);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await req.json();
    const { movie, error } = await updateMovie(params.id, updates);
    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json(movie);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { success, error } = await deleteMovie(params.id);
    if (!success) {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete movie' },
      { status: 500 }
    );
  }
}
