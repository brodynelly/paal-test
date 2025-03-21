"use client"
import { BarChartVariant } from "@/components/BarChartVariantFull"
import { Tooltip } from "@/components/Tooltip"
import { Transaction } from "@/data/schema"
import { transactions } from "@/data/transactions"
import { AvailableChartColorsKeys } from "@/lib/chartUtils"
import { cx, formatters } from "@/lib/utils"
import { InfoIcon } from "lucide-react"
import { useQueryState } from "nuqs"
import { useMemo } from "react"
import { DEFAULT_RANGE, RANGE_DAYS, RangeKey } from "./dateRanges"

interface ChartDataItem {
  key?: string
  value?: number
  date?: string
  [key: string]: number | string | undefined
}

type ChartType = "amount" | "count" | "category" | "merchant"

interface ChartConfig {
  title: string
  tooltipContent: string
  processData: (
    transactions: Transaction[],
    filterDate: Date,
    filters: Filters,
  ) => ChartDataItem[]
  valueFormatter: (value: number) => string
  layout?: "horizontal" | "vertical"
  color: string
  xValueFormatter?: (value: string) => string
}

interface Filters {
  expenseStatus: string
  minAmount: number
  maxAmount: number
  selectedCountries: string[]
}

// Generate random integer values (1-5) for each day
const generateDailyIntegerData = (days: number) => {
  const data = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate random counts for each value (1-5)
    const total = 100 // Total observations per day
    const values = [1, 2, 3, 4, 5]
    let remaining = total
    const counts: { [key: number]: number } = {}

    values.forEach((value, index) => {
      if (index === values.length - 1) {
        counts[value] = remaining
      } else {
        const count = Math.floor(Math.random() * (remaining - (values.length - index - 1)))
        counts[value] = count
        remaining -= count
      }
    })

    data.push({
      date: date.toISOString().split('T')[0],
      ...counts
    })
  }

  return data
}

const chartConfigs: Record<ChartType, ChartConfig> = {
  amount: {
    title: "Daily Integer Value Distribution",
    tooltipContent: "Distribution of integer values (1-5) recorded each day",
    color: "blue",
    processData: (transactions, filterDate, filters) => {
      const days = Math.ceil((new Date().getTime() - filterDate.getTime()) / (1000 * 60 * 60 * 24))
      return generateDailyIntegerData(days)
    },
    valueFormatter: (number: number) => `${number}%`,
    xValueFormatter: (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    },
  },
  count: {
    title: "Transaction Count",
    tooltipContent:
      "Total number of transactions for the selected period and amount range.",
    processData: (transactions, filterDate, filters) => {
      const countedData: Record<string, number> = {}
      transactions.forEach((transaction) => {
        const date = transaction.transaction_date.split("T")[0]
        if (isTransactionValid(transaction, filterDate, filters)) {
          countedData[date] = (countedData[date] || 0) + 1
        }
      })
      return Object.entries(countedData).map(([date, value]) => ({
        key: date,
        value,
      }))
    },
    valueFormatter: (number: number) =>
      Intl.NumberFormat("us").format(number).toString(),
    color: "blue",
    xValueFormatter: (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    },
  },
  category: {
    title: "Top 5 Categories by Transaction Amount",
    tooltipContent:
      "Total amount of transactions for the top 5 categories in the selected period and amount range.",
    processData: (transactions, filterDate, filters) => {
      const categoryTotals: Record<string, number> = {}
      transactions.forEach((transaction) => {
        if (isTransactionValid(transaction, filterDate, filters)) {
          categoryTotals[transaction.category] =
            (categoryTotals[transaction.category] || 0) + transaction.amount
        }
      })
      return Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, value]) => ({ key: category, value }))
    },
    valueFormatter: (number: number) =>
      formatters.currency({ number: number, maxFractionDigits: 0 }),
    layout: "vertical",
    color: "emerald",
  },
  merchant: {
    title: "Top 5 Merchants by Transaction Amount",
    tooltipContent:
      "Total amount of transactions for the top 5 merchants in the selected period and amount range.",
    processData: (transactions, filterDate, filters) => {
      const merchantTotals: Record<string, number> = {}
      transactions.forEach((transaction) => {
        if (isTransactionValid(transaction, filterDate, filters)) {
          merchantTotals[transaction.merchant] =
            (merchantTotals[transaction.merchant] || 0) + transaction.amount
        }
      })
      return Object.entries(merchantTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([merchant, value]) => ({ key: merchant, value }))
    },
    valueFormatter: (number: number) =>
      formatters.currency({ number: number, maxFractionDigits: 0 }),
    layout: "vertical",
    color: "orange",
  },
}

const isTransactionValid = (
  transaction: Transaction,
  filterDate: Date,
  filters: Filters,
) => {
  const { expenseStatus, minAmount, maxAmount, selectedCountries } = filters
  const transactionDate = new Date(transaction.transaction_date)
  return (
    transactionDate >= filterDate &&
    (expenseStatus === "all" || transaction.expense_status === expenseStatus) &&
    transaction.amount >= minAmount &&
    transaction.amount <= maxAmount &&
    (selectedCountries.length === 0 ||
      selectedCountries.includes(transaction.country))
  )
}

export function TransactionChart({
  type,
  yAxisWidth,
  showYAxis,
  className,
  showPercentage = false,
}: {
  type: ChartType
  yAxisWidth?: number
  showYAxis?: boolean
  className?: string
  showPercentage?: boolean
}) {
  const [range] = useQueryState<RangeKey>("range", {
    defaultValue: DEFAULT_RANGE,
    parse: (value): RangeKey =>
      Object.keys(RANGE_DAYS).includes(value)
        ? (value as RangeKey)
        : DEFAULT_RANGE,
  })
  const [expenseStatus] = useQueryState("expense_status", {
    defaultValue: "all",
  })
  const [amountRange] = useQueryState("amount_range", {
    defaultValue: "0-Infinity",
  })
  const [selectedCountries] = useQueryState<string[]>("countries", {
    defaultValue: [],
    parse: (value: string) => (value ? value.split("+") : []),
    serialize: (value: string[]) => value.join("+"),
  })

  const [minAmount, maxAmount] = useMemo(() => {
    const [min, max] = amountRange.split("-").map(Number)
    return [min, max === Infinity ? Number.MAX_SAFE_INTEGER : max]
  }, [amountRange])

  const config = chartConfigs[type]

  const chartData = useMemo(() => {
    const currentDate = new Date()
    const filterDate = new Date(currentDate)
    const daysToSubtract = RANGE_DAYS[range] || RANGE_DAYS[DEFAULT_RANGE]
    filterDate.setDate(currentDate.getDate() - daysToSubtract)

    const filters: Filters = {
      expenseStatus,
      minAmount,
      maxAmount,
      selectedCountries,
    }

    const data = config.processData(transactions, filterDate, filters)

    // For amount type (integer values 1-5), calculate percentages
    if (type === "amount" && showPercentage) {
      return data.map(day => {
        const total = Object.entries(day)
          .filter(([key]) => !isNaN(Number(key)))
          .reduce((sum, [, count]) => sum + (count as number), 0)

        const percentages: any = { date: day.date }
        Object.entries(day)
          .filter(([key]) => !isNaN(Number(key)))
          .forEach(([value, count]) => {
            percentages[value] = ((count as number) / total) * 100
          })

        return percentages
      })
    }

    return data
  }, [range, expenseStatus, minAmount, maxAmount, selectedCountries, config, type, showPercentage])

  const categories = type === "amount" ? ["1", "2", "3", "4", "5"] : ["value"]
  const colors: AvailableChartColorsKeys[] = type === "amount"
    ? ["blue", "emerald", "violet", "amber", "gray"]
    : [config.color as AvailableChartColorsKeys]

  return (
    <div className={cx(className, "w-full")}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <h2
            id={`${type}-chart-title`}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {config.title}
          </h2>
          <Tooltip side="bottom" content={config.tooltipContent}>
            <InfoIcon className="size-4 text-gray-600 dark:text-gray-400" />
          </Tooltip>
        </div>
      </div>
      <BarChartVariant
        data={chartData}
        index={type === "amount" ? "date" : "key"}
        categories={categories}
        showLegend={type === "amount"}
        colors={colors}
        yAxisWidth={yAxisWidth}
        valueFormatter={config.valueFormatter}
        xValueFormatter={config.xValueFormatter}
        showYAxis={showYAxis}
        className="m-4 h-64"
        layout={config.layout}
        barCategoryGap="6%"
        aria-labelledby={`${type}-chart-title`}
        role="figure"
        aria-roledescription="chart"
      />
    </div>
  )
}