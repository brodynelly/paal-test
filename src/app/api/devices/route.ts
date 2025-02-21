import { Device } from '@/models/Device';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const devices = await Device.find({}).sort({ lastUpdate: -1 });
    
    // Transform the data to match the expected format
    const transformedDevices = devices.map(device => ({
      id: device.deviceId,
      created: device.insertionTime || new Date().toISOString(),
      deviceName: device.deviceName,
      type: device.deviceType,
      status: device.status,
      priority: device.status === 'online' ? 'low' : device.status === 'warning' ? 'medium' : 'high',
      lastDataPoint: device.lastUpdate ? new Date(device.lastUpdate).toISOString() : new Date().toISOString()
    }));

    return NextResponse.json(transformedDevices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}