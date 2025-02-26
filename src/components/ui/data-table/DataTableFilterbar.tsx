"use client"

import { Button } from "@/components/Button"
import { Searchbar } from "@/components/Searchbar"
import { conditions, healthStatuses, pigGroups } from "@/data/data"
import { RiAddLine, RiDownloadLine } from "@remixicon/react"
import { Table } from "@tanstack/react-table"
import React, { useState } from "react"; // for adding in event listeners for opening adding button
import { useDebouncedCallback } from "use-debounce"
import { DataTableFilter } from "./DataTableFilter"
import { ViewOptions } from "./DataTableViewOptions"
import { PigDrawer } from "./NewDrawer"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function Filterbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchTerm, setSearchTerm] = useState<string>("")

  const debouncedSetFilterValue = useDebouncedCallback((value) => {
    table.getColumn("breed")?.setFilterValue(value)
  }, 300)

  const handleSearchChange = (event: any) => {
    const value = event.target.value
    setSearchTerm(value)
    debouncedSetFilterValue(value)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-x-6">
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
        {table.getColumn("status")?.getIsVisible() && (
          <DataTableFilter
            column={table.getColumn("status")}
            title="Health Status"
            options={healthStatuses}
            type="select"
          />
        )}
        {table.getColumn("region")?.getIsVisible() && (
          <DataTableFilter
            column={table.getColumn("region")}
            title="Group"
            options={pigGroups}
            type="checkbox"
          />
        )}
        {table.getColumn("costs")?.getIsVisible() && (
          <DataTableFilter
            column={table.getColumn("costs")}
            title="Age"
            type="number"
            options={conditions}
          />
        )}
        {table.getColumn("breed")?.getIsVisible() && (
          <Searchbar
            type="search"
            placeholder="Search by breed..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:max-w-[250px] sm:[&>input]:h-[30px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="border border-gray-200 px-2 font-semibold text-indigo-600 sm:border-none sm:py-1 dark:border-gray-800 dark:text-indigo-500"
          >
            Clear filters
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/*  add option for adding a pig */ }
        <Button
          onClick={() => setIsOpen(true)}
          variant="secondary"
          className="hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex"
        >
          <RiAddLine className="size-4 shrink-0" aria-hidden="true" />
          Add
        </Button>
        <PigDrawer open={isOpen} onOpenChange={setIsOpen} />
        <Button
          variant="secondary"
          className="hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex"
        >
          <RiDownloadLine className="size-4 shrink-0" aria-hidden="true" />
          Export
        </Button>
        <ViewOptions table={table} />
      </div>
    </div>
  )
}