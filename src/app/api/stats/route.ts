import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://iot-pig-monitoring-backend.onrender.com/api/stats')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}