import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface RouteParams {
  params: Promise<{ product: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { product } = await params;
  const fileName = product.endsWith('.json') ? product : `${product}.json`;
  const filePath = join(process.cwd(), 'radar-data', fileName);

  if (!existsSync(filePath)) {
    return NextResponse.json(
      { error: `Radar data not found for product: ${product}` },
      { status: 404 },
    );
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error reading radar data for ${product}:`, error);
    return NextResponse.json(
      { error: 'Error reading radar data' },
      { status: 500 },
    );
  }
}
