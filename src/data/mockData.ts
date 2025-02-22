import { BCSDistribution, Device, MonitoringStats, Pig, PostureDistribution, TemperatureReading } from "@/types/monitoring"
import { subDays, subHours } from "date-fns"

const now = new Date()

// Mock devices data with realistic sensor names and values
export const devices: Device[] = [
  {
    id: 1,
    name: "TempSensor-A1",
    type: "Temperature",
    status: "online",
    lastUpdate: new Date().toISOString(),
    temperature: 24.5,
  },
  {
    id: 2,
    name: "TempSensor-A2",
    type: "Temperature",
    status: "warning",
    lastUpdate: subHours(now, 1).toISOString(),
    temperature: 26.8,
  },
  {
    id: 3,
    name: "TempSensor-B1",
    type: "Temperature",
    status: "offline",
    lastUpdate: subHours(now, 3).toISOString(),
    temperature: 23.9,
  },
  {
    id: 4,
    name: "TempSensor-B2",
    type: "Temperature",
    status: "online",
    lastUpdate: new Date().toISOString(),
    temperature: 25.2,
  },
]

// Mock pig data with realistic values
export const pigs: Pig[] = [
  {
    id: 1,
    groupId: 1,
    breed: "Large White",
    age: 24,
    bcsScore: 3.5,
    posture: 2,
    lastUpdate: new Date().toISOString(),
  },
  {
    id: 2,
    groupId: 1,
    breed: "Yorkshire",
    age: 18,
    bcsScore: 2.8,
    posture: 1,
    lastUpdate: subHours(now, 2).toISOString(),
  },
  {
    id: 3,
    groupId: 2,
    breed: "Duroc",
    age: 30,
    bcsScore: 4.0,
    posture: 3,
    lastUpdate: new Date().toISOString(),
  },
]

// Mock posture distribution data
export const postureDistribution: PostureDistribution[] = [
  { posture: 1, count: 15, percentage: 30 }, // Standing
  { posture: 2, count: 20, percentage: 40 }, // Lying
  { posture: 3, count: 10, percentage: 20 }, // Sitting
  { posture: 4, count: 5, percentage: 10 },  // Moving
]

// Mock BCS (Body Condition Score) distribution
export const bcsDistribution: BCSDistribution[] = [
  { score: 2.5, count: 8, percentage: 16 },
  { score: 3.0, count: 15, percentage: 30 },
  { score: 3.5, count: 18, percentage: 36 },
  { score: 4.0, count: 9, percentage: 18 },
]

// Generate 24 hours of temperature readings for each device
export const generateTemperatureReadings = (): TemperatureReading[] => {
  const readings: TemperatureReading[] = []
  const baseTemp = 24 // Base temperature in Celsius

  devices.forEach(device => {
    for (let i = 0; i < 24; i++) {
      // Add realistic temperature variations
      const timeOfDay = i / 24 // 0 to 1 representing time of day
      const dailyCycle = Math.sin(timeOfDay * 2 * Math.PI) // Temperature cycle throughout the day
      const randomVariation = (Math.random() * 2 - 1) * 0.5 // Random variation between -0.5 and 0.5
      const temperature = baseTemp + (dailyCycle * 2) + randomVariation

      readings.push({
        deviceId: device.id,
        timestamp: subHours(now, 23 - i).toISOString(),
        value: Number(temperature.toFixed(1)),
      })
    }
  })

  return readings.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

export const temperatureReadings = generateTemperatureReadings()

// Generate 7 days of monitoring stats with realistic trends
export const monitoringStats: MonitoringStats[] = Array.from({ length: 7 }, (_, i) => {
  const dayOffset = 6 - i
  const baselinePigs = 50
  const pigVariation = Math.floor(Math.random() * 5) - 2 // -2 to +2 variation
  const deviceVariation = Math.floor(Math.random() * 2) // 0 to 1 variation
  const tempVariation = (Math.random() * 2 - 1) * 0.5 // -0.5 to 0.5 variation

  return {
    totalPigs: baselinePigs + pigVariation,
    activeDevices: 3 + deviceVariation,
    averageTemperature: 24.5 + tempVariation,
    criticalAlerts: Math.floor(Math.random() * 3),
    date: subDays(now, dayOffset).toISOString(),
  }
})