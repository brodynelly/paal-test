import { Pig } from '@/models/Pig';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const pig = await Pig.findOne({ pigId: parseInt(params.id) });
    
    if (!pig) {
      return NextResponse.json({ error: 'Pig not found' }, { status: 404 });
    }

    return NextResponse.json(pig);
  } catch (error) {
    console.error('Error fetching pig:', error);
    return NextResponse.json({ error: 'Failed to fetch pig' }, { status: 500 });
  }
}