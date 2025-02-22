"use client"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { LineChart } from "@/components/LineChart"
import axios from "axios"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface DeviceData {
  deviceId: number
  deviceName: string
  deviceType: string
  status: "online" | "offline" | "warning"
  temperature: number
  lastUpdate: string
}

interface TemperatureData {
  recordId: number
  deviceId: number
  temperature: number
  timestamp: string
}

export default function DeviceDashboard() {
  const params = useParams()
  const [device, setDevice] = useState<DeviceData | null>(null)
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureData[]>([])
  const [associatedPig, setAssociatedPig] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        // Fetch device details
        const deviceResponse = await axios.get(`https://iot-pig-monitoring-backend.onrender.com/api/devices/${params.id}`)
        setDevice(deviceResponse.data)

        // Fetch temperature history
        const tempResponse = await axios.get(`https://iot-pig-monitoring-backend.onrender.com/api/devices/${params.id}/temperature`)
        setTemperatureHistory(tempResponse.data)

        // Fetch associated pig if any
        const pigResponse = await axios.get(`https://iot-pig-monitoring-backend.onrender.com/api/devices/${params.id}/pig`)
        if (pigResponse.data.pigId) {
          setAssociatedPig(pigResponse.data.pigId)
        }
      } catch (error) {
        console.error('Error fetching device data:', error)
        setError('Failed to fetch device data')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchDeviceData()
    }
  }, [params.id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!device) {
    return <div>Device not found</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="success">Online</Badge>
      case 'warning':
        return <Badge variant="warning">Warning</Badge>
      default:
        return <Badge variant="error">Offline</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            {device.deviceName}
          </h1>
          <p className="text-sm text-gray-500">
            Device ID: {device.deviceId} • Type: {device.deviceType}
          </p>
        </div>
        {getStatusBadge(device.status)}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <h3 className="text-lg font-medium">Temperature History</h3>
          <div className="h-[400px] w-full">
            <LineChart
              data={temperatureHistory.map(record => ({
                date: record.timestamp,
                Temperature: record.temperature
              }))}
              index="date"
              categories={["Temperature"]}
              colors={["indigo"]}
              valueFormatter={(value) => `${value.toFixed(1)}°C`}
              showLegend={false}
              showXAxis={true}
              showYAxis={true}
              showGridLines={true}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Device Information</h3>
          <dl className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Temperature</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {device.temperature.toFixed(1)}°C
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Update</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {new Date(device.lastUpdate).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="text-lg font-medium">Associated Pig</h3>
          <div className="mt-4">
            {associatedPig ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  This device is monitoring Pig #{associatedPig}
                </p>
                <Link
                  href={`/pigs/${associatedPig}`}
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View Pig Details
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No pig is currently associated with this device.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}