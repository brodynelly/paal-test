// Tremor Raw cx [v0.0.0]

import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

// Tremor Raw focusInput [v0.0.1]

export const focusInput = [
  // base
  "focus:ring-2",
  // ring color
  "focus:ring-indigo-200 focus:dark:ring-indigo-700/30",
  // border color
  "focus:border-indigo-500 focus:dark:border-indigo-700",
]

// Tremor Raw focusRing [v0.0.1]

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-indigo-500 dark:outline-indigo-500",
]

// Tremor Raw hasErrorInput [v0.0.1]

export const hasErrorInput = [
  // base
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color
  "ring-red-200 dark:ring-red-700/30",
]

// ✅ Improved Number Formatter with Safety Checks
export const usNumberFormatter = (number: number | null | undefined, decimals = 0) => {
  if (typeof number !== "number" || isNaN(number)) return "0"

  const fixedNumber = Number(number.toFixed(decimals))
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fixedNumber)
}

export const percentageFormatter = (number: number | null | undefined, decimals = 1) => {
  if (typeof number !== "number" || isNaN(number)) return "0%"

  const fixedNumber = Number(number.toFixed(4))
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fixedNumber)

  const symbol = fixedNumber > 0 ? "+" : ""
  return `${symbol}${formattedNumber}`
}

export const millionFormatter = (number: number | null | undefined, decimals = 1) => {
  if (typeof number !== "number" || isNaN(number)) return "0M"

  const fixedNumber = Number(number.toFixed(decimals))
  const formattedNumber = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(fixedNumber)

  return `${formattedNumber}M`
}

export const formatters: { [key: string]: any } = {
  currency: (number: number | null | undefined, currency: string = "USD") => {
    if (typeof number !== "number" || isNaN(number)) return "$0.00"

    const fixedNumber = Number(number.toFixed(4))
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(fixedNumber)
  },
  unit: (number: number | null | undefined) => {
    if (typeof number !== "number" || isNaN(number)) return "0"
    
    const fixedNumber = Number(number.toFixed(4))
    return usNumberFormatter(fixedNumber)
  },
}
