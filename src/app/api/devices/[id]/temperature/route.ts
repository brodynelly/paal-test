import { TemperatureData } from '@/models/TemperatureData';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const temperatureData = await TemperatureData.find({ 
      deviceId: parseInt(params.id) 
    }).sort({ timestamp: -1 }).limit(100);

    return NextResponse.json(temperatureData);
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    return NextResponse.json({ error: 'Failed to fetch temperature data' }, { status: 500 });
  }
}