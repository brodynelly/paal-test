import { PostureData } from '@/models/PostureData';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const postureData = await PostureData.find({ 
      pigId: parseInt(params.id) 
    }).sort({ timestamp: -1 }).limit(100);

    return NextResponse.json(postureData);
  } catch (error) {
    console.error('Error fetching posture data:', error);
    return NextResponse.json({ error: 'Failed to fetch posture data' }, { status: 500 });
  }
}