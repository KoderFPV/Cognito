import { NextRequest, NextResponse } from 'next/server';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { findAllProducts } from '@/models/products/productsModel';

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get('page');
  const pageSizeParam = searchParams.get('pageSize');

  const page = pageParam ? parseInt(pageParam) : 1;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam) : 10;

  if (page < 1 || pageSize < 1 || pageSize > 100) {
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
  }

  try {
    const db = await connectToMongo();
    const offset = (page - 1) * pageSize;
    const { products, total } = await findAllProducts(db, pageSize, offset);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
};
