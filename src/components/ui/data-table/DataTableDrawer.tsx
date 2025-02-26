"use client"
import { Button } from "@/components/Button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter
} from "@/components/Drawer"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import {
    Select,
    SelectContent,
    SelectItemExtended,
    SelectTrigger,
    SelectValue,
} from "@/components/Select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { PigIdInput } from "./CheckPig"; // used to check duplicate Pig IDs

// -------------------------
// Types for API data

type Farm = {
  _id: string
  name: string
  location?: string
  barns: [] // Farms come with an empty barns array.
}

type Barn = {
  _id: string
  name: string
  description?: string
  farmId: string
}

type Stall = {
  _id: string
  name: string
  barnId: string
  farmId: string
}

// -------------------------
// Pig Form Data type matching your Pig model
// Note: the user-defined pig identifier is stored in pigId.
export type PigFormData = {
  pigId: string       // user-defined pigId (this is the displayed/edited id)
  tag: string         // pig tag
  farm: string        // farm _id (non-changeable in edit)
  barn: string        // barn _id (non-changeable in edit)
  stall: string       // stall _id (changeable)
  breed: string
  age: string         // will be converted to Number on submit
}

// -------------------------
// File types for feed uploads.
const fileTypes = [
  "Posture Data",
  "BCS Data",
  "PigBreathRate",
  "Pig HealthStatus",
  "Pig Heat Status",
  "Pig Vulva Sweeling",
]

// -------------------------
// Form field component

const FormField = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="mb-4">
    <Label className="font-medium">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
)

// -------------------------
// Details Form Component
// All fields are controlled so the current pig data is pre-filled using pigId (not _id).
interface DetailsFormProps {
  formData: PigFormData
  onUpdateForm: (updates: Partial<PigFormData>) => void
  farms: Farm[]
  barns: Barn[]
  stalls: Stall[]
}

const DetailsForm = ({ formData, onUpdateForm, farms, barns, stalls }: DetailsFormProps) => {
  // Find current farm and barn.
  const currentFarm = farms.find((farm) => farm._id === formData.farm)
  const currentBarn = barns.find((barn) => barn._id === formData.barn)
  // Filter stalls based on current barn.
  const availableStalls = currentBarn
    ? stalls.filter((stall) => stall.barnId === currentBarn._id)
    : []

  return (
    <div className="space-y-6">
      {/* Display fixed farm */}
      <FormField label="Farm">
        <Input
          value={currentFarm?.name || ""}
          disabled
          placeholder="Farm not set"
        />
      </FormField>
      {/* Display fixed barn */}
      <FormField label="Barn">
        <Input
          value={currentBarn?.name || ""}
          disabled
          placeholder="Barn not set"
        />
      </FormField>
      {/* Allow changing stall */}
      <FormField label="Stall">
        <Select
          value={formData.stall}
          onValueChange={(value: string) => onUpdateForm({ stall: value })}
          disabled={!currentBarn}
        >
          <SelectTrigger>
            <SelectValue placeholder={currentBarn ? "Select Stall" : "Barn not set"} />
          </SelectTrigger>
          <SelectContent>
            {availableStalls.map((stall) => (
              <SelectItemExtended
                key={stall._id}
                value={stall._id}
                option={stall.name}
                description={`Stall in ${currentBarn?.name || ""}`}
              />
            ))}
          </SelectContent>
        </Select>
      </FormField>
      {/* Editable fields */}
      <FormField label="Pig ID">
        <PigIdInput
          value={formData.pigId}
          onChange={(value) => onUpdateForm({ pigId: value })}
          onError={(error) => {
            /* Optionally handle error */
          }}
        />
      </FormField>
      <FormField label="Tag">
        <Input
          name="tag"
          value={formData.tag}
          onChange={(e) => onUpdateForm({ tag: e.target.value })}
          placeholder="Enter pig tag"
        />
      </FormField>
      <FormField label="Breed">
        <Input
          name="breed"
          value={formData.breed}
          onChange={(e) => onUpdateForm({ breed: e.target.value })}
          placeholder="Enter breed"
        />
      </FormField>
      <FormField label="Age (months)">
        <Input
          name="age"
          type="number"
          value={formData.age}
          onChange={(e) => onUpdateForm({ age: e.target.value })}
          placeholder="Enter age"
          min="0"
        />
      </FormField>
    </div>
  )
}

// -------------------------
// Feed Form Component
// Allows the user to upload files and choose a file type.
const FeedForm = () => {
  const [files, setFiles] = useState<File[]>([])
  const [selectedFileType, setSelectedFileType] = useState<string>("")
  const { getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => setFiles(acceptedFiles),
  })

  const filesList = files.map((file) => (
    <li
      key={file.name}
      className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#090E1A]"
    >
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button
          type="button"
          className="rounded-md p-2 text-gray-400 transition-all hover:text-rose-500 dark:text-gray-600 hover:dark:text-rose-500"
          aria-label="Remove file"
          onClick={() =>
            setFiles((prevFiles) =>
              prevFiles.filter((prevFile) => prevFile.name !== file.name)
            )
          }
        >
          X
        </button>
      </div>
      <div className="flex items-center space-x-3 truncate">
        <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
          <span className="text-sm">File</span>
        </span>
        <div className="truncate pr-20">
          <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-50">
            {file.name}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
            {file.size} bytes
          </p>
        </div>
      </div>
    </li>
  ))

  return (
    <div className="space-y-6">
      <div>
        <Label className="font-medium" htmlFor="fileType">
          File Type
        </Label>
        <Select
          value={selectedFileType}
          onValueChange={(value: string) => setSelectedFileType(value)}
        >
          <SelectTrigger id="fileType" className="mt-2">
            <SelectValue placeholder="Select file type" />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map((type, index) => (
              <SelectItemExtended key={index} value={type} option={type} description="" />
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="file-upload" className="font-medium">
          Upload File
        </Label>
        <div className="relative mt-2 flex h-36 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <div>
            <span className="flex justify-center">
              <span className="text-4xl">📄</span>
            </span>
            <div className="mt-2 text-center">
              <label
                htmlFor="file-upload"
                className="cursor-pointer rounded-md text-sm text-gray-700 dark:text-gray-300"
              >
                Click to select or drag file here
                <input
                  {...getInputProps()}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supported types: PDF, JPG, PNG, etc.
              </p>
            </div>
          </div>
        </div>
        {filesList.length > 0 && (
          <ul role="list" className="mt-2 space-y-4">
            {filesList}
          </ul>
        )}
      </div>
    </div>
  )
}

// -------------------------
// Main Edit Drawer Component
interface PigEditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: PigFormData & { _id: string } // pig's backend _id for updating
}

export function PigEditDrawer({ open, onOpenChange, initialData }: PigEditDrawerProps) {
  // Pre-fill form data from the provided pig data.
  const [formData, setFormData] = useState<PigFormData>({
    pigId: initialData.pigId,
    tag: initialData.tag,
    farm: initialData.farm,
    barn: initialData.barn,
    stall: initialData.stall,
    breed: initialData.breed,
    age: initialData.age,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // API data states for farms, barns, and stalls.
  const [farms, setFarms] = useState<Farm[]>([])
  const [barns, setBarns] = useState<Barn[]>([])
  const [stalls, setStalls] = useState<Stall[]>([])

  // Fetch farms on mount.
  useEffect(() => {
    axios
      .get("http://localhost:5005/api/farms")
      .then((res) => setFarms(res.data))
      .catch((err) => console.error("Error fetching farms:", err))
  }, [])

  // For editing, the farm and barn are fixed.
  useEffect(() => {
    if (formData.farm) {
      axios
        .get(`http://localhost:5005/api/barns?farmId=${formData.farm}`)
        .then((res) => setBarns(res.data))
        .catch((err) => console.error("Error fetching barns for farm:", err))
    } else {
      setBarns([])
    }
  }, [formData.farm])

  // Fetch stalls on mount.
  useEffect(() => {
    axios
      .get("http://localhost:5005/api/stalls")
      .then((res) => setStalls(res.data))
      .catch((err) => console.error("Error fetching stalls:", err))
  }, [])

  const handleUpdateForm = (updates: Partial<PigFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Prepare data to match your Pig model.
      const preparedData = {
        pigId: Number(formData.pigId),
        tag: formData.tag,
        breed: formData.breed,
        age: Number(formData.age),
        currentLocation: {
          farmId: formData.farm,
          barnId: formData.barn,
          stallId: formData.stall,
        },
      }
      // PUT request to update the pig using its backend _id.
      await axios.put(`http://localhost:5005/api/pigs/${initialData._id}`, preparedData)
      console.log("Pig data updated:", preparedData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating pig data:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-x-hidden sm:max-w-lg">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
          <TabsList className="px-6">
            <TabsTrigger value="details" className="px-4">
              Details
            </TabsTrigger>
            <TabsTrigger value="feed" className="px-4">
              Feed
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="px-6 py-4">
            <DetailsForm
              formData={formData}
              onUpdateForm={handleUpdateForm}
              farms={farms}
              barns={barns}
              stalls={stalls}
            />
          </TabsContent>
          <TabsContent value="feed" className="px-6 py-4">
            <FeedForm />
          </TabsContent>
        </Tabs>
        <DrawerFooter className="-mx-6 -mb-2 gap-2 px-6 sm:justify-between">
          <DrawerClose asChild>
            <Button variant="secondary" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Changes"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
