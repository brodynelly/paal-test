import { TemperatureData } from '@/models/TemperatureData';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const tempData = await TemperatureData.find({
      timestamp: { $gte: last24Hours }
    }).sort({ timestamp: 1 });

    return NextResponse.json(tempData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch temperature history' }, { status: 500 });
  }
}