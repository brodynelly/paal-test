"use client"
import { Card } from "@/components/Card"
import { CategoryBar } from "@/components/CategoryBar"
import { Divider } from "@/components/Divider_S"
import { LineChartSupport } from "@/components/LineChartSupport"
import { ProgressCircle } from "@/components/ProgressCircle_S"
import { DataTable } from "@/components/ui/data-table-support/DataTable"
import { columns } from "@/components/ui/data-table-support/columns"
import { volume } from "@/data/support/volume"
import { subscribeToDevices } from "@/lib/socket"
import { useEffect, useState } from "react"

export default function Support() {
  const [devices, setDevices] = useState([])
  const [deviceMetrics, setDeviceMetrics] = useState({
    totalDevices: 0,
    deviceStatus: [],
    performance: {
      runtimeExpected: 0,
      criticalCondition: 0
    },
    volumeTrends: {
      today: 0,
      yesterday: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('https://iot-pig-monitoring-backend.onrender.com/api/devices')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setDevices(data)
        updateMetrics(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching device data:', error)
        setError('Failed to fetch device data')
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToDevices((data) => {
      setDevices(data)
      updateMetrics(data)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const updateMetrics = (deviceData: any[]) => {
    const totalDevices = deviceData.length
    const onlineDevices = deviceData.filter(d => d.status === 'online').length
    const warningDevices = deviceData.filter(d => d.status === 'warning').length
    const offlineDevices = deviceData.filter(d => d.status === 'offline').length

    setDeviceMetrics({
      totalDevices,
      deviceStatus: [
        { status: "Devices Up", percentage: (onlineDevices / totalDevices) * 100, count: onlineDevices },
        { status: "Device Maintenance", percentage: (warningDevices / totalDevices) * 100, count: warningDevices },
        { status: "Down", percentage: (offlineDevices / totalDevices) * 100, count: offlineDevices }
      ],
      performance: {
        runtimeExpected: 92.5,
        criticalCondition: 7.5
      },
      volumeTrends: {
        today: 1850,
        yesterday: 1600
      }
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Device Monitoring
          </h1>
          <p className="text-gray-500 sm:text-sm/6 dark:text-gray-500">
            Real-time monitoring of IoT devices with performance insights
          </p>
        </div>
      </div>
      <Divider />
      <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <dt className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Total Devices
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-50">
            {deviceMetrics.totalDevices}
          </dd>
          <CategoryBar
            values={deviceMetrics.deviceStatus.map(s => s.percentage)}
            className="mt-6"
            colors={["blue", "lightGray", "red"]}
            showLabels={false}
          />
          <ul
            role="list"
            className="mt-4 flex flex-wrap gap-x-10 gap-y-4 text-sm"
          >
            {deviceMetrics.deviceStatus.map((status, index) => (
              <li key={status.status}>
                <span className="text-base font-semibold text-gray-900 dark:text-gray-50">
                  {status.percentage.toFixed(1)}%
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cx(
                      "size-2.5 shrink-0 rounded-sm",
                      index === 0 ? "bg-blue-500 dark:bg-blue-500" :
                      index === 1 ? "bg-gray-400 dark:bg-gray-600" :
                      "bg-red-500 dark:bg-red-500"
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm">{status.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <dt className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Device Performance
          </dt>
          <div className="mt-4 flex items-center justify-between gap-y-4">
            <dd className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm bg-blue-500 dark:bg-blue-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Runtime Expected</span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {deviceMetrics.performance.runtimeExpected}%
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm bg-red-500 dark:bg-red-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-50">
                    Critical Condition
                  </span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {deviceMetrics.performance.criticalCondition}%
                </span>
              </div>
            </dd>
            <ProgressCircle value={deviceMetrics.performance.runtimeExpected} radius={45} strokeWidth={7} />
          </div>
        </Card>
        <Card>
          <dt className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Volume Trends
          </dt>
          <div className="mt-4 flex items-center gap-x-8 gap-y-4">
            <dd className="space-y-3 whitespace-nowrap">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm bg-blue-500 dark:bg-blue-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Today</span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {deviceMetrics.volumeTrends.today}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm bg-gray-400 dark:bg-gray-600"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Yesterday</span>
                </div>
                <span className="mt-1 block text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {deviceMetrics.volumeTrends.yesterday}
                </span>
              </div>
            </dd>
            <LineChartSupport
              className="h-28"
              data={volume}
              index="time"
              categories={["Today", "Yesterday"]}
              colors={["blue", "lightGray"]}
              showTooltip={false}
              valueFormatter={(number: number) =>
                Intl.NumberFormat("us").format(number).toString()
              }
              startEndOnly={true}
              showYAxis={false}
              showLegend={false}
            />
          </div>
        </Card>
      </dl>
      <DataTable data={devices} columns={columns} />
    </main>
  )
}

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}