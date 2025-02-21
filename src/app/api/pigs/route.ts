import { Pig } from '@/models/Pig';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const pigs = await Pig.find({}).sort({ lastUpdate: -1 });
    
    // Transform the data to match the expected format
    const transformedPigs = pigs.map(pig => ({
      owner: `PIG-${pig.pigId.toString().padStart(3, '0')}`,
      status: pig.bcsScore >= 4 ? "critical" : pig.bcsScore >= 3 ? "healthy" : "suspicious",
      costs: pig.age,
      region: `Group ${pig.groupId}`,
      stability: Math.floor(Math.random() * 100), // Random health risk for demo
      lastEdited: pig.lastUpdate ? new Date(pig.lastUpdate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      breed: pig.breed
    }));

    return NextResponse.json(transformedPigs);
  } catch (error) {
    console.error('Error fetching pigs:', error);
    return NextResponse.json({ error: 'Failed to fetch pigs' }, { status: 500 });
  }
}