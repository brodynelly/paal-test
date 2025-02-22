"use client"
import { Button } from "@/components/Button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/Dialog"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/Select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table"
import { cx } from "@/lib/utils"
import { RiAddLine } from "@remixicon/react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import axios from "axios"
import { useState } from "react"
import { toast } from "react-toastify"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
  const pageSize = 16
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceType: '',
    status: ''
  })

  const table = useReactTable({
    data,
    columns,
    enableColumnResizing: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
  })

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axios.post('https://iot-pig-monitoring-backend.onrender.com/api/devices', formData)
      setCreateDialogOpen(false)
      window.location.reload() // Refresh to show new device
    } catch (error) {
      console.error('Error creating device:', error)
      // Here you would show an error notification
      toast.error(`Error creating device: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 space-y-3">
        <div className="flex justify-end">
          <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2 text-base sm:text-sm">
            Add Device
            <RiAddLine className="-mr-0.5 size-5 shrink-0" aria-hidden="true" />
          </Button>
        </div>
      <div className="relative overflow-hidden overflow-x-auto">
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-gray-200 dark:border-gray-800"
              >
                {headerGroup.headers.map((header) => (
                  <TableHeaderCell
                    key={header.id}
                    className={cx(
                      "whitespace-nowrap py-2.5",
                      header.column.columnDef.meta?.className,
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHeaderCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="odd:bg-gray-50 odd:dark:bg-[#090E1A]">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cx(
                      "whitespace-nowrap py-2.5",
                      cell.column.columnDef.meta?.className,
                      cell.column.columnDef.meta?.cell,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDevice}>
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="deviceName">Device Name</Label>
                  <Input
                    id="deviceName"
                    placeholder="e.g., TempSensor-C1"
                    className="mt-2"
                    value={formData.deviceName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      deviceName: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Select
                    value={formData.deviceType}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      deviceType: value
                    }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Temperature</SelectItem>
                      <SelectItem value="humidity">Humidity</SelectItem>
                      <SelectItem value="motion">Motion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      status: value
                    }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setCreateDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Device'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}