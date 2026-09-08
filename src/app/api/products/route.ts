import { NextResponse } from 'next/server';
import { getAvailableProducts } from '@/radar/infrastructure/utils/getAvailableProducts';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = getAvailableProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to get products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
