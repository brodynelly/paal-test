"use client"

import { Badge } from "@/components/Badge"
import { Checkbox } from "@/components/Checkbox"
import { healthStatuses } from "@/data/data"
import { Usage } from "@/data/schema"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { ConditionFilter } from "./DataTableFilter"
import { DataTableRowActions } from "./DataTableRowActions"
import Link from "next/link"

const columnHelper = createColumnHelper<Usage>()

export const columns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={() => table.toggleAllPageRowsSelected()}
        className="translate-y-0.5"
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        className="translate-y-0.5"
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      displayName: "Select",
    },
  }),
  columnHelper.accessor("owner", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pig ID" />
    ),
    cell: ({ row }) => {
      const pigId = row.original.owner.replace('PIG-', '')
      return (
        <Link 
          href={`/pigs/${pigId}`}
          className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {row.original.owner}
        </Link>
      )
    },
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Pig ID",
    },
  }),
  columnHelper.accessor("breed", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Breed" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Breed",
    },
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Health Status" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Health Status",
    },
    cell: ({ row }) => {
      const status = healthStatuses.find(
        (item) => item.value === row.getValue("status"),
      )

      if (!status) {
        return null
      }

      return (
        <Badge variant={status.variant as any}>
          {status.label}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("region", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Group",
    },
    filterFn: "arrIncludesSome",
  }),
  columnHelper.accessor("stability", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Health Risk" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Health Risk",
    },
    cell: ({ getValue }) => {
      const value = getValue()

      function Indicator({ number }: { number: number }) {
        let category
        if (number < 30) {
          category = "healthy"
        } else if (number < 75) {
          category = "suspicious"
        } else {
          category = "critical"
        }

        const getBarClass = (index: number) => {
          if (category === "healthy") {
            return "bg-emerald-600 dark:bg-emerald-500"
          } else if (category === "suspicious" && index < 2) {
            return "bg-yellow-600 dark:bg-yellow-500"
          } else if (category === "critical" && index < 1) {
            return "bg-red-600 dark:bg-red-500"
          }
          return "bg-gray-300 dark:bg-gray-800"
        }

        return (
          <div className="flex gap-0.5">
            <div className={`h-3.5 w-1 rounded-sm ${getBarClass(0)}`} />
            <div className={`h-3.5 w-1 rounded-sm ${getBarClass(1)}`} />
            <div className={`h-3.5 w-1 rounded-sm ${getBarClass(2)}`} />
          </div>
        )
      }

      return (
        <div className="flex items-center gap-0.5">
          <span className="w-6">{value}</span>
          <Indicator number={value} />
        </div>
      )
    },
  }),
  columnHelper.accessor("costs", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age (months)" />
    ),
    enableSorting: true,
    meta: {
      className: "text-right",
      displayName: "Age",
    },
    cell: ({ getValue }) => {
      return (
        <span className="font-medium">{getValue()} months</span>
      )
    },
    filterFn: (row, columnId, filterValue: ConditionFilter) => {
      const value = row.getValue(columnId) as number
      const [min, max] = filterValue.value as [number, number]

      switch (filterValue.condition) {
        case "is-equal-to":
          return value == min
        case "is-between":
          return value >= min && value <= max
        case "is-greater-than":
          return value > min
        case "is-less-than":
          return value < min
        default:
          return true
      }
    },
  }),
  columnHelper.accessor("lastEdited", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Update" />
    ),
    enableSorting: false,
    meta: {
      className: "tabular-nums",
      displayName: "Last Update",
    },
  }),
  columnHelper.display({
    id: "edit",
    header: "Edit",
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "text-right",
      displayName: "Edit",
    },
    cell: ({ row }) => <DataTableRowActions row={row} />,
  }),
] as ColumnDef<Usage>[]