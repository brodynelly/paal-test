import { BCSData } from '@/models/BCSData';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const bcsData = await BCSData.find({ 
      pigId: parseInt(params.id) 
    }).sort({ timestamp: -1 }).limit(100);

    return NextResponse.json(bcsData);
  } catch (error) {
    console.error('Error fetching BCS data:', error);
    return NextResponse.json({ error: 'Failed to fetch BCS data' }, { status: 500 });
  }
}