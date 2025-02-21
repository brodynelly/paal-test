import { OverviewData } from "./schema"

// Use a fixed seed for random data to ensure consistency between server and client
const generateMonitoringData = () => {
  const data: OverviewData[] = []
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 30)

  // Fixed base values
  const baseTemp = 24.5
  const baseBCS = 3.5
  const basePosture = 2

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    // Use deterministic variations based on the date
    const timeOfDay = i / 30
    const monthCycle = Math.sin(timeOfDay * 2 * Math.PI)
    
    // Use date-based random variations instead of Math.random()
    const dateBasedVariation = (i % 7) / 10 - 0.3 // Will give consistent values between -0.3 and 0.3

    const temperature = Number((baseTemp + (monthCycle * 1.5) + dateBasedVariation).toFixed(4))
    const bcsScore = Number(Math.max(2.5, Math.min(4.5, baseBCS + (monthCycle * 0.3) + dateBasedVariation)).toFixed(4))
    const posture = Math.max(1, Math.min(4, Math.round(basePosture + (monthCycle * 0.5) + dateBasedVariation)))

    data.push({
      date: currentDate.toISOString(),
      Temperature: temperature,
      "BCS Score": bcsScore,
      Posture: posture,
    })
  }

  return data
}

export const overviewData = generateMonitoringData()