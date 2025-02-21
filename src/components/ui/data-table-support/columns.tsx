import { Badge } from "@/components/Badge"
import { cx } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

export const columns = [
  {
    header: "Created at",
    accessorKey: "created",
    meta: {
      className: "text-left",
    },
    cell: ({ row }) => (
      <>
        {new Date(row.original.created).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </>
    ),
  },
  {
    header: "Device Name",
    accessorKey: "deviceName",
    meta: {
      className: "text-left",
      cell: "font-medium text-gray-900 dark:text-gray-50",
    },
    cell: ({ row }) => (
      <Link 
        href={`/devices/${row.original.id}`}
        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {row.original.deviceName}
      </Link>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    meta: {
      className: "text-left",
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    meta: {
      className: "text-left",
    },
    cell: ({ row }) => {
      const status = row.original.status
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'online':
            return 'bg-emerald-500 dark:bg-emerald-500'
          case 'maintenance':
            return 'bg-yellow-500 dark:bg-yellow-500'
          case 'offline':
            return 'bg-red-500 dark:bg-red-500'
          default:
            return 'bg-gray-500 dark:bg-gray-500'
        }
      }
      
      return (
        <div className="flex items-center gap-2">
          <span
            className={cx(
              "size-2 shrink-0 rounded-full",
              getStatusColor(status)
            )}
            aria-hidden="true"
          />
          <span className="capitalize">{status}</span>
        </div>
      )
    },
  },
  {
    header: "Priority",
    accessorKey: "priority",
    meta: {
      className: "text-left",
    },
    cell: ({ row }) => {
      const priority = row.original.priority
      const getBadgeVariant = (priority: string) => {
        switch (priority) {
          case 'high':
            return 'error'
          case 'medium':
            return 'warning'
          case 'low':
            return 'success'
          default:
            return 'neutral'
        }
      }
      
      return (
        <Badge variant={getBadgeVariant(priority)} className="capitalize">
          {priority}
        </Badge>
      )
    },
  },
  {
    header: "Last Data Point",
    accessorKey: "lastDataPoint",
    meta: {
      className: "text-right",
    },
    cell: ({ row }) => (
      <>
        {new Date(row.original.lastDataPoint).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </>
    ),
  },
] as ColumnDef<any>[]