import { Device } from '@/models/Device';
import { Pig } from '@/models/Pig';
import { PigGroup } from '@/models/PigGroup';
import { BCSData } from '@/models/BCSData';
import { PostureData } from '@/models/PostureData';
import { TemperatureData } from '@/models/TemperatureData';
import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      Device.deleteMany({}),
      Pig.deleteMany({}),
      PigGroup.deleteMany({}),
      BCSData.deleteMany({}),
      PostureData.deleteMany({}),
      TemperatureData.deleteMany({})
    ]);

    // Create sample pig groups
    const pigGroups = await PigGroup.create([
      { groupId: 1, stallId: 1, farmId: 1 },
      { groupId: 2, stallId: 2, farmId: 1 },
      { groupId: 3, stallId: 3, farmId: 1 },
      { groupId: 4, stallId: 4, farmId: 1 }
    ]);

    // Create sample devices
    const devices = await Device.create([
      { deviceId: 1, deviceName: 'TempSensor-A1', deviceType: 'Temperature', status: 'online', temperature: 24.5 },
      { deviceId: 2, deviceName: 'TempSensor-A2', deviceType: 'Temperature', status: 'warning', temperature: 26.8 },
      { deviceId: 3, deviceName: 'TempSensor-B1', deviceType: 'Temperature', status: 'offline', temperature: 23.9 },
      { deviceId: 4, deviceName: 'TempSensor-B2', deviceType: 'Temperature', status: 'online', temperature: 25.2 }
    ]);

    // Create sample pigs with realistic data
    const pigs = await Pig.create([
      { pigId: 1, groupId: 1, breed: 'Large White', age: 24, bcsScore: 3.5, posture: 2 },
      { pigId: 2, groupId: 1, breed: 'Yorkshire', age: 18, bcsScore: 2.8, posture: 1 },
      { pigId: 3, groupId: 2, breed: 'Duroc', age: 30, bcsScore: 4.0, posture: 3 },
      { pigId: 4, groupId: 2, breed: 'Hampshire', age: 22, bcsScore: 3.2, posture: 1 },
      { pigId: 5, groupId: 3, breed: 'Berkshire', age: 28, bcsScore: 3.7, posture: 2 }
    ]);

    // Create sample BCS data
    const bcsData = await BCSData.create(
      pigs.flatMap(pig => ([
        { pigId: pig.pigId, bcsScore: pig.bcsScore, timestamp: new Date() },
        { pigId: pig.pigId, bcsScore: pig.bcsScore + 0.2, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ]))
    );

    // Create sample posture data
    const postureData = await PostureData.create(
      pigs.flatMap(pig => ([
        { pigId: pig.pigId, posture: pig.posture, timestamp: new Date() },
        { pigId: pig.pigId, posture: ((pig.posture + 1) % 4) || 1, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ]))
    );

    // Create sample temperature data
    const temperatureData = await TemperatureData.create(
      devices.flatMap(device => ([
        { deviceId: device.deviceId, temperature: device.temperature, timestamp: new Date() },
        { deviceId: device.deviceId, temperature: device.temperature + 0.5, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ]))
    );

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        pigGroups: pigGroups.length,
        devices: devices.length,
        pigs: pigs.length,
        bcsData: bcsData.length,
        postureData: postureData.length,
        temperatureData: temperatureData.length
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}