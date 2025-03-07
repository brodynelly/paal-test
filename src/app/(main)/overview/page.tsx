"use client"

import { ChartCard } from "@/components/ui/overview/DashboardChartCard"
import FertilityProgressCard from "@/components/ui/overview/DashboardFertilityCard"
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar"
import { ProgressBarCard } from "@/components/ui/overview/DashboardProgressBarCard"
import api from "@/lib/axios"
import { subscribeToStats } from "@/lib/socket"
import { subDays } from "date-fns"
import React from "react"
import { DateRange } from "react-day-picker"

export type PeriodValue = "previous-period" | "last-year" | "no-comparison"

const categories: { title: "Temperature" | "BCS Score" | "Posture"; type: "unit" | "currency"; }[] = [
  {
    title: "Temperature",
    type: "unit",
  },
  {
    title: "BCS Score",
    type: "unit",
  },
  {
    title: "Posture",
    type: "unit",
  },
]

export type KpiEntry = {
  title: string
  percentage: number
  current: number
  allowed: number
  unit?: string
}

export type KpiEntryExtended = {
  title: string
  percentage: number
  value: string
  color: string
}

const maxDate = new Date()

const defaultDeviceData: KpiEntry[] = [
  {
    title: "Online Devices",
    percentage: 0,
    current: 0,
    allowed: 0,
  },
  {
    title: "Data Collection Rate",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Storage Usage",
    percentage: 0,
    current: 0,
    allowed: 10,
    unit: "GB",
  },
]

const defaultHealthData: KpiEntry[] = [
  {
    title: "At Risk",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Healthy",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Critical",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "No Movement",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
]

const defaultFertilityStatus: KpiEntry[] = [
  {
    title: "In-Heat",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Pre-Heat",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Open",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
  {
    title: "Ready-to-Breed",
    percentage: 0,
    current: 0,
    allowed: 100,
    unit: "%",
  },
]

export default function Overview() {
  const [selectedDates, setSelectedDates] = React.useState<DateRange | undefined>({
    from: subDays(maxDate, 7),
    to: maxDate,
  })
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodValue>("previous-period")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    categories.map((category) => category.title),
  )
  const [deviceData, setDeviceData] = React.useState<KpiEntry[]>(defaultDeviceData)
  const [healthData, setHealthData] = React.useState<KpiEntry[]>(defaultHealthData)
  const [FertilityStatus, setFertilityData] = React.useState<KpiEntry[]>(defaultFertilityStatus)

  const [postureDistribution, setPostureDistribution] = React.useState<KpiEntryExtended[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const updateStats = React.useCallback((data: any) => {
    // Update device data
    setDeviceData([
      {
        title: "Online Devices",
        percentage: data.deviceStats.deviceUsage,
        current: data.deviceStats.onlineDevices,
        allowed: data.deviceStats.totalDevices,
      },
      {
        title: "Data Collection Rate",
        percentage: 92,
        current: 92,
        allowed: 100,
        unit: "%",
      },
      {
        title: "Storage Usage",
        percentage: 45,
        current: 4.5,
        allowed: 10,
        unit: "GB",
      },
    ])
    setHealthData([
      {
        title: "At Risk",
        percentage: (data.pigHealthStats.totalAtRisk / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalAtRisk,
        allowed: data.pigStats.totalPigs,
      },
      {
        title: "Healthy",
        percentage: (data.pigHealthStats.totalHealthy / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalHealthy,
        allowed: data.pigStats.totalPigs,
      },
      {
        title: "Critical",
        percentage: (data.pigHealthStats.totalCritical / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalCritical,
        allowed: data.pigStats.totalPigs,
      },
      {
        title: "No Movement",
        percentage: (data.pigHealthStats.totalNoMovement / data.pigStats.totalPigs) * 100,
        current: data.pigHealthStats.totalNoMovement,
        allowed: data.pigStats.totalPigs,
      },
    ])

    setFertilityData([
      {
        title: "In-Heat",
        percentage: ((data.pigFertilityStats["InHeat"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["InHeat"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Pre-Heat",
        percentage: ((data.pigFertilityStats["PreHeat"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["PreHeat"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Open",
        percentage: ((data.pigFertilityStats["Open"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["Open"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
      {
        title: "Ready-To-Breed",
        percentage: ((data.pigFertilityStats["ReadyToBreed"] ?? 0) / (data.pigStats.totalPigs ?? 1)) * 100,
        current: data.pigFertilityStats["ReadyToBreed"] ?? 0,
        allowed: data.pigStats.totalPigs ?? 100,
      },
    ]);


    setIsLoading(false)
  }, [])

  // Initial data fetch
  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.get('/stats')
        console.log(response.data)
        updateStats(response.data)
      } catch (error) {
        console.error('Error fetching initial data:', error)
        setError('Failed to fetch initial data. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [updateStats])

  // Subscribe to real-time updates
  React.useEffect(() => {
    const unsubscribe = subscribeToStats(updateStats)
    return () => {
      unsubscribe()
    }
  }, [updateStats])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    )
  }
  console.log("FertilityStatus Data:", FertilityStatus);


  return (
    <>
      <section aria-labelledby="current-status">
        <h1
          id="current-status"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Current Status
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <ProgressBarCard
            title="Device Status"
            change="+1.2%"
            value="75%"
            valueDescription="of devices online"
            ctaDescription="Device maintenance due in 5 days."
            ctaText="View devices"
            ctaLink="/support"
            data={deviceData}
          />
          <ProgressBarCard
            title="Health Metrics"
            change="-0.5%"
            value="85%"
            valueDescription="normal health indicators"
            ctaDescription="2 pigs require attention."
            ctaText="View details"
            ctaLink="/details"
            data={healthData}
          />
          
          <FertilityProgressCard
            title="Fertility Metrics"
            change="+1.2%"
            value="78%"
            valueDescription="optimal breeding conditions"
            ctaDescription="3 pigs ready for breeding."
            ctaText="View details"
            ctaLink="/fertility-details"
            data={FertilityStatus}
          />
        </div>
      </section>
      <section aria-labelledby="monitoring-overview">
        <h1
          id="monitoring-overview"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Monitoring Overview
        </h1>
        <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
          <Filterbar
            maxDate={maxDate}
            minDate={subDays(maxDate, 30)}
            selectedDates={selectedDates}
            onDatesChange={(dates) => setSelectedDates(dates)}
            selectedPeriod={selectedPeriod}
            onPeriodChange={(period) => setSelectedPeriod(period)}
            categories={categories}
            setSelectedCategories={setSelectedCategories}
            selectedCategories={selectedCategories}
          />
        </div>
        <dl className="mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {categories
            .filter((category) => selectedCategories.includes(category.title))
            .map((category) => (
              <ChartCard
                key={category.title}
                title={category.title}
                type={category.type}
                selectedDates={selectedDates}
                selectedPeriod={selectedPeriod}
              />
            ))}
        </dl>
      </section>
    </>
  )
}