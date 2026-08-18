import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = request.headers.get('x-radar-secret');

  if (secret !== process.env.RADAR_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  revalidateTag('radar-data', 'default');
  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}
