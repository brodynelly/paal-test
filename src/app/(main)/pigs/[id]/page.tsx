"use client"

import { Badge } from "@/components/Badge"
// import { Card } from "@/components/Card"
//import { LineChart } from "@/components/LineChart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import api from "@/lib/axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Header from "./_components/Header"
import { LineChart } from "./_components/LineChart"
import { TransactionChart } from "./_components/TransactionChart"

interface PigData {
  _id: string;  // The MongoDB ObjectId as a string
  pigId: number; // Numeric pig ID
  tag: string;
  breed: string;
  age: number;
  lastUpdate: string;  // ISO 8601 formatted date-time string
  active: boolean;
  currentLocation: {
    farmId: string;
    barnId: string;
    stallId: string;
  };
  __v: number; // Version key, can be omitted in some cases
}


interface BCSData {
  _id: string;  // The MongoDB ObjectId as a string
  pigId: number;  // Numeric pig ID
  timestamp: string;  // ISO 8601 formatted date-time string
  score: number;  // BCS score value
  __v: number; // Version key, can be omitted in some cases
}

interface PostureData {
  _id: string;  // The MongoDB ObjectId as a string
  pigId: number;  // Numeric pig ID
  timestamp: string;  // ISO 8601 formatted date-time string
  score: number;  // Posture score
  __v: number; // Version key, can be omitted in some cases
}

export default function PigDashboard() {
  const params = useParams()
  const [pig, setPig] = useState<PigData | null>(null)
  const [bcsHistory, setBcsHistory] = useState<BCSData[]>([])
  const [postureHistory, setPostureHistory] = useState<PostureData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchPigData = async () => {
      try {
        const [pigResponse, bcsResponse, postureResponse] = await Promise.all([
          api.get(`/pigs/${params.id}`),
          api.get(`/pigs/${params.id}/bcs`),
          api.get(`/pigs/${params.id}/posture`)
        ])

        setPig(pigResponse.data)
        setBcsHistory(bcsResponse.data)
        setPostureHistory(postureResponse.data)
      } catch (error) {
        console.error('Error fetching pig data:', error)
        setError('Failed to fetch pig data')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPigData()
    }
  }, [params.id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!pig) {
    return <div>Pig not found</div>
  }

  const getBCSStatusBadge = (score: number) => {
    if (score >= 4) return <Badge variant="error">Critical</Badge>
    if (score >= 3) return <Badge variant="success">Healthy</Badge>
    return <Badge variant="warning">Attention Needed</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Pig {pig.pigId}
          </h1>
          <p className="text-sm text-gray-500">
            Group {pig.currentLocation.stallId} • {pig.breed}
          </p>
        </div>
        {getBCSStatusBadge(pig.age)}
      </div>

      <Header />
      <section className="my-8">
        <div className="space-y-12">
          {/* Daily Integer Value Distribution Chart */}
          <TransactionChart
            yAxisWidth={70}
            type="amount"
            className="hidden sm:block"
            showPercentage={true}
          />
          {/* optimized for mobile view */}
          <TransactionChart
            showYAxis={false}
            type="amount"
            className="sm:hidden"
            showPercentage={true}
          />
          {/* 
<LineChart
          className="mt-6 h-32"
          data={chartData || []}
          index="formattedDate"
          colors={["indigo", "gray"]}
          startEndOnly={true}
          valueFormatter={(value) => formatter(value as number)}
          showYAxis={false}
          showLegend={false}
          categories={categories}
          showTooltip={isThumbnail ? false : true}
          autoMinValue
        />
      </div> */}

          {/* Line Charts with Tabs */}
          <div className="space-y-4">
            <Tabs defaultValue="bcs">
              <TabsList>
                <TabsTrigger value="bcs">BCS Data</TabsTrigger>
                <TabsTrigger value="vulva">Vulva Swelling</TabsTrigger>
                <TabsTrigger value="breathing">Breathing Rate</TabsTrigger>
              </TabsList>
              <TabsContent value="bcs">
                <LineChart
                  yAxisWidth={70}
                  type="bcs"
                  //className="hidden sm:block"
                  startEndOnly={true}
                  showYAxis={true}
                  showLegend={false}
                  showTooltip={true}
                  autoMinValue
                />
                <LineChart showYAxis={false} type="bcs" className="sm:hidden" />
              </TabsContent>
              <TabsContent value="vulva">
                <LineChart
                  yAxisWidth={70}
                  type="vulva"
                  className="hidden sm:block"
                />
                <LineChart
                  showYAxis={false}
                  type="vulva"
                  className="sm:hidden"
                />
              </TabsContent>
              <TabsContent value="breathing">
                <LineChart
                  yAxisWidth={70}
                  type="breathing"
                  className="hidden sm:block"
                />
                <LineChart
                  showYAxis={false}
                  type="breathing"
                  className="sm:hidden"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
            <TransactionChart yAxisWidth={100} type="category" />
            <TransactionChart yAxisWidth={100} type="merchant" />
          </div> */}
        </div>
      </section>
    </div>
  )
}