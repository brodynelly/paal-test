// Update the ChartCard component to use React.memo to prevent unnecessary re-renders
import { PeriodValue } from "@/app/(main)/overview/page"
import React from "react"
// (removed)
import { Badge } from "@/components/Badge"
import { LineChart } from "@/components/LineChart"
import { overviewData } from "@/data/overview-data"
import { cx, formatters, percentageFormatter } from "@/lib/utils"
import {
  eachDayOfInterval,
  formatDate,
  interval,
  isWithinInterval,
} from "date-fns"
import Link from "next/link"
import { DateRange } from "react-day-picker"
import { getPeriod } from "./DashboardFilterbar"

export type CardProps = {
  title: keyof (typeof overviewData)[number]
  type: "currency" | "unit"
  selectedDates: DateRange | undefined
  selectedPeriod: PeriodValue
  isThumbnail?: boolean
}

const formattingMap = {
  currency: formatters.currency,
  unit: formatters.unit,
}

export const getBadgeType = (value: number) => {
  if (value > 0) {
    return "success"
  } else if (value < 0) {
    if (value < -50) {
      return "warning"
    }
    return "error"
  } else {
    return "neutral"
  }
}

export const ChartCard = React.memo(function ChartCard({
  title,
  type,
  selectedDates,
  selectedPeriod,
  isThumbnail,
}: CardProps) {
  const formatter = formattingMap[type]
  const selectedDatesInterval = React.useMemo(() =>
    selectedDates?.from && selectedDates?.to
      ? interval(selectedDates.from, selectedDates.to)
      : null,
    [selectedDates]
  )

  const allDatesInInterval = React.useMemo(() =>
    selectedDates?.from && selectedDates?.to
      ? eachDayOfInterval(interval(selectedDates.from, selectedDates.to))
      : null,
    [selectedDates]
  )

  const prevDates = React.useMemo(() => 
    getPeriod(selectedDates, selectedPeriod),
    [selectedDates, selectedPeriod]
  )

  const prevDatesInterval = React.useMemo(() =>
    prevDates?.from && prevDates?.to
      ? interval(prevDates.from, prevDates.to)
      : null,
    [prevDates]
  )

  const data = React.useMemo(() => 
    overviewData
      .filter((overview) => {
        if (selectedDatesInterval) {
          const overviewDate = new Date(overview.date)
          return isWithinInterval(overviewDate, selectedDatesInterval)
        }
        return true
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [selectedDatesInterval]
  )

  const prevData = React.useMemo(() => 
    overviewData
      .filter((overview) => {
        if (prevDatesInterval) {
          const overviewDate = new Date(overview.date)
          return isWithinInterval(overviewDate, prevDatesInterval)
        }
        return false
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [prevDatesInterval]
  )

  const chartData = React.useMemo(() => 
    allDatesInInterval
      ?.map((date, index) => {
        const overview = data[index]
        const prevOverview = prevData[index]
        const value = Number((overview?.[title] as number || 0).toFixed(4))
        const previousValue = Number((prevOverview?.[title] as number || 0).toFixed(4))

        const evolution =
          selectedPeriod !== "no-comparison" && value && previousValue
            ? Number(((value - previousValue) / previousValue).toFixed(4))
            : undefined

        return {
          title,
          date: date,
          formattedDate: formatDate(date, "dd/MM/yyyy"),
          value,
          previousDate: prevOverview?.date,
          previousFormattedDate: prevOverview
            ? formatDate(new Date(prevOverview.date), "dd/MM/yyyy")
            : null,
          previousValue:
            selectedPeriod !== "no-comparison" ? previousValue : null,
          evolution,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [allDatesInInterval, data, prevData, selectedPeriod, title]
  )

  const categories =
    selectedPeriod === "no-comparison" ? ["value"] : ["value", "previousValue"]
  
  const value = React.useMemo(() => 
    Number(
      (data?.reduce((acc, item) => acc + Number(item[title] || 0), 0) || 0).toFixed(4)
    ),
    [data, title]
  )

  const previousValue = React.useMemo(() => 
    Number(
      (prevData?.reduce((acc, item) => acc + Number(item[title] || 0), 0) || 0).toFixed(4)
    ),
    [prevData, title]
  )
  
  const evolution = React.useMemo(() => 
    selectedPeriod !== "no-comparison"
      ? Number(((value - previousValue) / previousValue).toFixed(4))
      : 0,
    [selectedPeriod, value, previousValue]
  )

  return (
    <Link href={`/metrics/${encodeURIComponent(title)}`} className="block">
      <div className={cx("transition hover:opacity-80")}>
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
              {title}
            </dt>
            {selectedPeriod !== "no-comparison" && (
              <Badge variant={getBadgeType(evolution)}>
                {percentageFormatter(evolution)}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <dd className="text-xl text-gray-900 dark:text-gray-50">
            {formatter(value)}
          </dd>
          {selectedPeriod !== "no-comparison" && (
            <dd className="text-sm text-gray-500">
              from {formatter(previousValue)}
            </dd>
          )}
        </div>
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
      </div>
    </Link>
  )
})