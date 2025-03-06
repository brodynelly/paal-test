"use client"
import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import { RadioCardGroup, RadioCardItem } from "@/components/RadioCardGroup"
import {
  Select,
  SelectContent,
  SelectItemExtended,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { PigIdInput } from "./CheckPig"; // Assume this handles checking for duplicate Pig IDs

// -------------------------
// Types for API data

type Farm = {
  _id: string
  name: string
  location?: string
  barns: [] // Each farm now has an empty barns array.
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
// Note: pigId and age are input as strings and converted on submission.
type PigFormData = {
  pigId: string       // user-defined pigId (unique, numeric)
  tag: string         // required tag field
  farm: string        // farm _id
  barn: string        // barn _id
  stall: string       // stall _id
  breed: string
  age: string         // will be converted to Number on submit
}

// -------------------------
// Form field component

const FormField = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div>
    <Label className="font-medium">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
)

// -------------------------
// First Page: Cascading selections for Farms, Barns, and Stalls

interface FirstPageProps {
  formData: PigFormData
  onUpdateForm: (updates: Partial<PigFormData>) => void
  farms: Farm[]
  barns: Barn[]
  stalls: Stall[]
}

const FirstPage = ({ formData, onUpdateForm, farms, barns, stalls }: FirstPageProps) => {
  // Filter barns to only those associated with the selected farm.
  const availableBarns = barns.filter(
    (barn) => barn.farmId.toString() === formData.farm
  )
  // Filter stalls based on the selected barn.
  const availableStalls = formData.barn
    ? stalls.filter((stall) => stall.barnId === formData.barn)
    : []
  // Get the selected barn (to display its name in stall descriptions).
  const selectedBarn = availableBarns.find((barn) => barn._id === formData.barn)

  // When pigId changes, update the formData to also include the tag.


  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          <p>Add Pig Details</p>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
            Farm, Barn & Stall Information
          </span>
        </DrawerTitle>
      </DrawerHeader>
      <DrawerBody className="-mx-6 space-y-6 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
        {/* Farms: rendered as a radio group */}
        <FormField label="Farms">
          <RadioCardGroup
            defaultValue={formData.farm}
            className="grid grid-cols-2 gap-2 text-sm"
            onValueChange={(value) => {
              // When a new farm is selected, reset barn and stall.
              onUpdateForm({ farm: value, barn: "", stall: "" })
            }}
          >
            {farms.map((farm) => (
              <RadioCardItem
                key={farm._id}
                value={farm._id}
                className="flex flex-col justify-start p-2.5 text-base duration-75 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=checked]:border-transparent data-[state=checked]:bg-blue-500 data-[state=checked]:text-white sm:text-sm dark:focus:ring-blue-500"
              >
                {farm.name}
              </RadioCardItem>
            ))}
          </RadioCardGroup>
        </FormField>

        {/* Barns: rendered as a select dropdown */}
        <FormField label="Barns">
          <Select
            value={formData.barn}
            onValueChange={(value: string) => onUpdateForm({ barn: value, stall: "" })}
            disabled={!formData.farm}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.farm ? "Select Barn" : "Select Farm first"} />
            </SelectTrigger>
            <SelectContent>
              {availableBarns.map((barn) => (
                <SelectItemExtended
                  key={barn._id}
                  value={barn._id}
                  option={barn.name}
                  description={barn.description || ""}
                />
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Stalls: rendered as a select dropdown */}
        <FormField label="Stalls">
          <Select
            value={formData.stall}
            onValueChange={(value: string) => onUpdateForm({ stall: value })}
            disabled={!formData.barn}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.barn ? "Select Stall" : "Select Barn first"} />
            </SelectTrigger>
            <SelectContent>
              {availableStalls.map((stall) => (
                <SelectItemExtended
                  key={stall._id}
                  value={stall._id}
                  option={stall.name}
                  description={`Stall in ${selectedBarn?.name || ''}`}
                />
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </DrawerBody>
    </>
  )
}

// -------------------------
// Second Page: Additional Pig Data Editing
// Now includes fields for Pig ID, Tag, Breed and Age.
interface SecondPageProps {
  formData: PigFormData;
  onUpdateForm: (updates: Partial<PigFormData>) => void;
}

const SecondPage = ({ formData, onUpdateForm }: SecondPageProps) => {
  const handlePigIdChange = (value: string) => {
    // Update both pigId and tag in the form state.
    onUpdateForm({ pigId: value });
    onUpdateForm({ tag: value ? `PIG-${value}` : "" }); 
  };

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          <p>Edit Pig Details</p>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
            Pig ID, Tag, Breed & Age
          </span>
        </DrawerTitle>
      </DrawerHeader>
      <DrawerBody className="-mx-6 space-y-6 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
        <FormField label="">
          <PigIdInput
            value={formData.pigId || ""}
            onChange={(value) => handlePigIdChange(value)}
            onError={(error) => {
              /* Handle error message state if needed */
            }}
          />
        </FormField>
        <FormField label="Tag">
          <Input
            disabled
            name="tagDisplay"
            value={formData.pigId ? `PIG-${formData.pigId}` : ""}
            placeholder="Enter pig id"
          />
          <input
            type="hidden"
            name="tag"
            value={formData.pigId ? `PIG-${formData.pigId}` : ""}
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
      </DrawerBody>
    </>
  );
};

// -------------------------
// Summary Page: Review Pig Data

const SummaryItem = ({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-sm">{value ?? "Not provided"}</p>
  </div>
)

const SummaryPage = ({
  formData,
  farms,
  barns,
  stalls,
}: {
  formData: PigFormData
  farms: Farm[]
  barns: Barn[]
  stalls: Stall[]
}) => {
  const selectedFarm = farms.find((farm) => farm._id === formData.farm)
  const selectedBarn = barns.find((barn) => barn._id === formData.barn)
  const selectedStall = formData.barn ? stalls.find((stall) => stall._id === formData.stall) : undefined

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          <p>Review Pig Data</p>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
            Please review all details before submitting
          </span>
        </DrawerTitle>
      </DrawerHeader>
      <DrawerBody className="-mx-6 space-y-4 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
        <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="font-medium">Pig Information</h3>
          <div className="mt-4 space-y-4">
            <SummaryItem label="Pig ID" value={formData.pigId} />
            <SummaryItem label="Tag" value={formData.tag} />
            <SummaryItem label="Farm" value={selectedFarm?.name} />
            <SummaryItem label="Barn" value={selectedBarn?.name} />
            <SummaryItem label="Stall" value={selectedStall?.name} />
            <SummaryItem label="Breed" value={formData.breed} />
            <SummaryItem label="Age" value={formData.age} />
          </div>
        </div>
      </DrawerBody>
    </>
  )
}

// -------------------------
// Main Drawer Component

interface PigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PigDrawer({ open, onOpenChange }: PigDrawerProps) {
  // Form data state
  const [formData, setFormData] = useState<PigFormData>({
    pigId: "",
    tag: "",
    farm: "",
    barn: "",
    stall: "",
    breed: "",
    age: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // API data states for farms, barns, and stalls
  const [farms, setFarms] = useState<Farm[]>([])
  const [barns, setBarns] = useState<Barn[]>([])
  const [stalls, setStalls] = useState<Stall[]>([])

  // Fetch farms on mount
  useEffect(() => {
    axios
      .get("http://localhost:5005/api/farms")
      .then((res) => {
        setFarms(res.data)
      })
      .catch((err) => console.error("Error fetching farms:", err))
  }, [])

  // Whenever a farm is selected, fetch barns for that farm.
  useEffect(() => {
    if (formData.farm) {
      axios
        .get(`http://localhost:5005/api/barns?farmId=${formData.farm}`)
        .then((res) => {
          setBarns(res.data)
        })
        .catch((err) => console.error("Error fetching barns for farm:", err))
    } else {
      setBarns([])
    }
  }, [formData.farm])

  // Fetch stalls on mount
  useEffect(() => {
    axios
      .get("http://localhost:5005/api/stalls")
      .then((res) => {
        setStalls(res.data)
      })
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
      await axios.post("http://localhost:5005/api/pigs", preparedData)
      console.log("Pig data submitted:", preparedData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting pig data:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <FirstPage
            formData={formData}
            onUpdateForm={handleUpdateForm}
            farms={farms}
            barns={barns}
            stalls={stalls}
          />
        )
      case 2:
        return <SecondPage formData={formData} onUpdateForm={handleUpdateForm} />
      case 3:
        return <SummaryPage formData={formData} farms={farms} barns={barns} stalls={stalls} />
      default:
        return null
    }
  }

  const renderFooter = () => {
    if (currentPage === 1) {
      return (
        <>
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          <Button
            onClick={() => setCurrentPage(2)}
            disabled={!formData.farm || !formData.barn || !formData.stall}
          >
            Continue
          </Button>
        </>
      )
    }
    if (currentPage === 2) {
      return (
        <>
          <Button variant="secondary" onClick={() => setCurrentPage(1)}>
            Back
          </Button>
          <Button onClick={() => setCurrentPage(3)}>Review</Button>
        </>
      )
    }
    return (
      <>
        <Button variant="secondary" onClick={() => setCurrentPage(2)}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Pig Data"}
        </Button>
      </>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-x-hidden sm:max-w-lg">
        {renderPage()}
        <DrawerFooter className="-mx-6 -mb-2 gap-2 px-6 sm:justify-between">
          {renderFooter()}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

