"use client"
import { Button } from "@/components/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/Dialog";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { RiMoreFill } from "@remixicon/react";
import { Row, Table } from "@tanstack/react-table";
import { useState } from 'react';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Dropdown";

import api from "@/lib/axios";
import { PigEditDrawer, PigFormData } from "./DataTableDrawer";



interface DataTableRowActionsProps<TData> {
  table: Table<TData>
  row: Row<TData>
}

export function DataTableRowActions<TData extends PigFormData & { _id: string }>({ table, row }: DataTableRowActionsProps<TData>) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPig, setSelectedPig] = useState<any>(null)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [editPigData, setEditPigData] = useState<PigFormData & { _id: string } | null>(null)

  const handleEdit = (row: Row<TData>) => {
    setEditPigData(row.original)  // assuming row.original holds the pig data
    setEditDrawerOpen(true)
  }

  const handleSave = async (formData: any) => {
    setIsLoading(true)
    try {
      const pigId = selectedPig.owner.replace('PIG-', '')
      await api.put(`/pigs/${pigId}`, formData)
      window.location.reload() // Refresh to show updated data
    } catch (error) {
      console.error('Error updating pig:', error)
      // Here you would show an error notification
    } finally {
      setIsLoading(false)
      setEditDialogOpen(false)
    }
  }


  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group aspect-square p-1.5 hover:border hover:border-gray-300 data-[state=open]:border-gray-300 data-[state=open]:bg-gray-50 hover:dark:border-gray-700 data-[state=open]:dark:border-gray-700 data-[state=open]:dark:bg-gray-900"
          >
            <RiMoreFill
              className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-data-[state=open]:text-gray-700 group-hover:dark:text-gray-300 group-data-[state=open]:dark:text-gray-300"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem>Add</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(row)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600 dark:text-red-500">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editPigData && (
        <PigEditDrawer
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          initialData={editPigData}
        />
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pig Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            handleSave({
              breed: formData.get('breed'),
              age: formData.get('age'),
              group: formData.get('group')
            })
          }}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    name="breed"
                    defaultValue={selectedPig?.breed}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age (months)</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    defaultValue={selectedPig?.costs}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

  )
}
