export interface Device {
  id: number
  name: string
  type: string
  status: "online" | "offline" | "warning"
  lastUpdate: string
  temperature: number
}

export interface Pig {
  id: number
  groupId: number
  breed: string
  age: number
  bcsScore: number
  posture: number
  lastUpdate: string
}

export interface MonitoringStats {
  totalPigs: number
  activeDevices: number
  averageTemperature: number
  criticalAlerts: number
  date: string
}

export interface PostureDistribution {
  posture: number
  count: number
  percentage: number
}

export interface BCSDistribution {
  score: number
  count: number
  percentage: number
}

export interface TemperatureReading {
  timestamp: string
  value: number
  deviceId: number
}