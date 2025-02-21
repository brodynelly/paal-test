import { Device } from '@/models/Device';
import { Pig } from '@/models/Pig';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    // This is a placeholder - you'll need to modify your schema to include
    // the relationship between devices and pigs
    const pig = await Pig.findOne({ deviceId: parseInt(params.id) });
    
    if (!pig) {
      return NextResponse.json({ pigId: null });
    }

    return NextResponse.json({ pigId: pig.pigId });
  } catch (error) {
    console.error('Error fetching associated pig:', error);
    return NextResponse.json({ error: 'Failed to fetch associated pig' }, { status: 500 });
  }
}