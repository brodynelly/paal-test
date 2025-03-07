"use client"
import { AreaChart } from "@/components/AreaChart"
import { useQueryState } from "nuqs"
import React, { useMemo } from "react"
import { DEFAULT_RANGE, RANGE_DAYS, RangeKey } from "./dateRanges"

interface LineChartProps {
  type: "bcs" | "vulva" | "breathing"
  yAxisWidth?: number
  showYAxis?: boolean
  className?: string
}

const generateDummyData = (days: number, type: "bcs" | "vulva" | "breathing") => {
  const data = []
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    let value = 0
    switch (type) {
      case "bcs":
        // BCS values between 1-5
        value = 2 + Math.random() * 3
        break
      case "vulva":
        // Vulva swelling values (arbitrary scale 0-10)
        value = Math.random() * 10
        break
      case "breathing":
        // Breathing rate (breaths per minute, typically 12-20)
        value = 12 + Math.random() * 8
        break
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(1))
    })
  }
  
  return data
}

export function LineChart({
  type,
  yAxisWidth,
  showYAxis,
  className,
}: LineChartProps) {
  const [range] = useQueryState<RangeKey>("range", {
    defaultValue: DEFAULT_RANGE,
    parse: (value): RangeKey =>
      Object.keys(RANGE_DAYS).includes(value)
        ? (value as RangeKey)
        : DEFAULT_RANGE,
  })

  const data = useMemo(() => {
    const days = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE]
    return generateDummyData(days, type)
  }, [range, type])

  const valueFormatter = (value: number) => {
    switch (type) {
      case "bcs":
        return value.toFixed(1)
      case "vulva":
        return `${value.toFixed(1)}/10`
      case "breathing":
        return `${value.toFixed(1)} bpm`
      default:
        return value.toString()
    }
  }

  const chartTitle = {
    bcs: "Body Condition Score",
    vulva: "Vulva Swelling",
    breathing: "Breathing Rate"
  }[type]

  return (
    <div className={className}>
      <AreaChart
        data={data}
        index="date"
        categories={["value"]}
        colors={["blue"]}
        valueFormatter={valueFormatter}
        yAxisWidth={yAxisWidth}
        showYAxis={showYAxis}
        showLegend={false}
        showGridLines={true}
        startEndOnly={false}
        showTooltip={true}
        autoMinValue={true}
        allowDecimals={true}
        xAxisLabel="Date"
        yAxisLabel={chartTitle}
      />
    </div>
  )
}