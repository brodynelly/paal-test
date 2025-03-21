"use client";

import { Button } from "@/components/Button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import {
  Select,
  SelectContent,
  SelectItemExtended,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import api from "@/lib/axios";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PigIdInput } from "./CheckPig";

// -------------------------
// Types
// -------------------------

type Farm = {
  _id: string;
  name: string;
  location?: string;
  barns: [];
};

type Barn = {
  _id: string;
  name: string;
  description?: string;
  farmId: string;
};

type Stall = {
  _id: string;
  name: string;
  barnId: string;
  farmId: string;
};

// The final shape your form expects:
export type PigFormData = {
  pigId: string; // numeric portion from "PIG-XXX"
  tag: string; // the entire owner string e.g. "PIG-085"
  farm: string; // farm _id (fetched from pig location)
  barn: string; // barn _id (fetched from pig location)
  stall: string; // stall _id (fetched from pig location)
  breed: string;
  age: string;
  currentLocation: {
    farmId: string;
    barnId: string;
    stallId: string;
  };
};

// Example of your server shape, e.g.:
// {
//   owner: "PIG-085",
//   status: "suspicious",
//   costs: 24,
//   region: "67c73ae8933c6281901e9a4f",
//   breed: "Berkshire",
//   ...
// }
type ServerPigData = {
  owner: string;
  breed?: string;
  costs?: number;
  [key: string]: any; // everything else
};

// -------------------------
// Helper: parse numeric pigId from "PIG-085" => "085"
// If owner is "PIG-123", returns "123"
// -------------------------
function getNumericId(owner: string | undefined): string {
  if (!owner) return "";
  // If it's "PIG-085", remove "PIG-" to get "085"
  return owner.replace(/^PIG-/i, "").trim();
}

// -------------------------
// File types for feed uploads
// -------------------------
const fileTypes = [
  "Posture Data",
  "BCS Data",
  "PigBreathRate",
  "Pig HealthStatus",
  "Pig Heat Status",
  "Pig Vulva Sweeling",
];

// -------------------------
// Shared FormField
// -------------------------
const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <Label className="font-medium">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
);

// -------------------------
// Details Form
// -------------------------
interface DetailsFormProps {
  formData: PigFormData;
  onUpdateForm: (updates: Partial<PigFormData>) => void;
  farms: Farm[];
  barns: Barn[];
  stalls: Stall[];
}

interface FeedFormProps {
  pigId: string; // Add pigId as a prop
}


const DetailsForm = ({
  formData,
  onUpdateForm,
  farms,
  barns,
  stalls,
}: DetailsFormProps) => {
  // Find the currently selected farm / barn objects:
  const currentFarm = formData.currentLocation.farmId;
  const currentBarn = formData.currentLocation.barnId;

  // Only show stalls for the chosen barn
  const currentStall = formData.currentLocation.stallId;

  return (
    <div className="space-y-6">
      <FormField label="Farm">
        <Input
          value={currentFarm || ""}
          disabled
          placeholder="Farm not set"
        />
      </FormField>
      <FormField label="Barn">
        <Input
          value={currentBarn || ""}
          disabled
          placeholder="Barn not set"
        />
      </FormField>
      <FormField label="Stall">
        <Input
          value={currentStall || ""}
          disabled
          placeholder="Farm not set"
        />
      </FormField>
      <FormField label="">
        <PigIdInput
          value={formData.pigId}
          onChange={(value) => onUpdateForm({ pigId: value })}
          onError={(error) => {
            /* handle error if needed */
          }}
        />
      </FormField>
      <FormField label="Tag (PIG-xxx)">
        <div className="flex">
          {/* Tiny disabled "PIG - " */}
          <Input disabled value="PIG -" className="h-auto w-auto" />
          {/* The numeric part input */}
          <Input
            value={formData.tag.replace(/^PIG-?/i, "")}
            onChange={(e) => {
              const numericPart = e.target.value.replace(/\D/g, "");
              onUpdateForm({ tag: `PIG-${numericPart}` });
            }}
            placeholder="123"
          />
        </div>
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
  );
};

// -------------------------
// Feed Form
// -------------------------

const FeedForm = ({ pigId }: FeedFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileType, setSelectedFileType] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const { getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const csvFiles = acceptedFiles.filter(
        (file) => file.type === "text/csv" || file.name.endsWith(".csv")
      );
      setFiles(csvFiles);
      if (csvFiles.length !== acceptedFiles.length) {
        setUploadError("Only .csv files are allowed.");
      } else {
        setUploadError(null);
      }
    },
    accept: {
      "text/csv": [".csv"],
    },
  });

  const handleUpload = async () => {
    if (!selectedFileType) {
      setUploadError("Please select a file type.");
      return;
    }

    if (files.length === 0) {
      setUploadError("Please select a file to upload.");
      return;
    }

    if (selectedFileType !== "Posture Data") {
      setUploadError("Only 'Posture Data' files can be uploaded here.");
      return;
    }

    const formData = new FormData();
    formData.append("file", files[0]); // Append the first file

    try {
      const response = await api.post(
        `/upload/postureUpload/${pigId}`, // Use the pigId prop
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setUploadSuccess(true);
        setUploadError(null);
        setFiles([]); // Clear the files after successful upload
      } else {
        setUploadError("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("An error occurred while uploading the file.");
    }
  };

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
          <span className="text-sm">CSV</span>
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
  ));

  return (
    <div className="space-y-6">
      <div>
        <Label className="font-medium" htmlFor="fileType">
          File Type
        </Label>
        <Select
          value={selectedFileType}
          onValueChange={(value: string) => {
            setSelectedFileType(value);
            setUploadError(null); // Clear error when file type changes
          }}
        >
          <SelectTrigger id="fileType" className="mt-2">
            <SelectValue placeholder="Select file type" />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map((type, index) => (
              <SelectItemExtended
                key={index}
                value={type}
                option={type}
                description=""
              />
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
                Supported types: CSV
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

      {/* Upload Button and Feedback */}
      <div className="mt-4">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || selectedFileType !== "Posture Data"}
          className="w-full"
        >
          Upload File
        </Button>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {uploadError}
          </p>
        )}
        {uploadSuccess && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            File uploaded successfully!
          </p>
        )}
      </div>
    </div>
  );
};

// -------------------------
// Main Edit Drawer
// -------------------------
interface PigEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ServerPigData;
}

export function PigEditDrawer({
  open,
  onOpenChange,
  initialData,
}: PigEditDrawerProps) {
  // 1) Parse pigId from "PIG-xxx"
  const numericId = useMemo(() => getNumericId(initialData.owner), [initialData.owner]);

  // 2) Initialize form data: pigId is numeric portion, tag is the entire `owner`
  const [formData, setFormData] = useState<PigFormData>({
    pigId: numericId,
    tag: initialData.owner, // the entire "PIG-xxx"
    farm: "",
    barn: "",
    stall: "",
    breed: initialData.breed ?? "",
    age: initialData.costs !== undefined ? String(initialData.costs) : "",
    currentLocation: {
      farmId: "",
      barnId: "",
      stallId: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // 3) Master lists
  const [farms, setFarms] = useState<Farm[]>([]);
  const [barns, setBarns] = useState<Barn[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);

  // 4) On mount, fetch master farm list
  useEffect(() => {
    api
      .get("farms")
      .then((res) => setFarms(res.data))
      .catch((err) => console.error("Error fetching farms:", err));
  }, []);

  // 5) On mount or whenever we get farm, fetch relevant barns
  useEffect(() => {
    if (formData.farm) {
      api
        .get(`/barns?farmId=${formData.farm}`)
        .then((res) => setBarns(res.data))
        .catch((err) => console.error("Error fetching barns for farm:", err));
    } else {
      setBarns([]);
    }
  }, [formData.farm]);

  // 6) On mount, fetch master stalls
  useEffect(() => {
    api
      .get("/stalls")
      .then((res) => setStalls(res.data))
      .catch((err) => console.error("Error fetching stalls:", err));
  }, []);

  // 7) [Important] Fetch location by numeric pigId (the part after "PIG-")
  // and then set the farm, barn, stall IDs accordingly.
  useEffect(() => {
    if (!formData.pigId) return;
    api
      .get(`/pigs/${formData.pigId}`)
      .then((res) => {
        // Suppose `res.data` = { farmId: "...", barnId: "...", stallId: "..." }
        setFormData((prev) => ({
          ...prev,
          currentLocation: res.data.currentLocation || "",
        }));
      })
      .catch((err) => console.error("Error fetching pig location:", err));
  }, [formData.pigId]);

  // Helper to update form state
  const handleUpdateForm = (updates: Partial<PigFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // 8) Submit changes
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // If your server expects numeric pigId, parse it:
      const preparedData = {
        pigId: Number(formData.pigId),
        tag: formData.tag, // "PIG-xxx"
        breed: formData.breed,
        age: Number(formData.age),
        currentLocation: {
          farmId: formData.currentLocation.farmId,
          barnId: formData.currentLocation.barnId,
          stallId: formData.currentLocation.stallId,
        },
      };
      // Example: PUT /api/pigs/85 with data
      await api.put(
        `/pigs/${formData.pigId}`,
        preparedData
      );
      console.log("Pig data updated:", preparedData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating pig data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-x-hidden sm:max-w-lg">
        <DrawerHeader className="-px-6 w-full">
          <DrawerTitle className="flex w-full items-center justify-between">
            {/* The tag is the entire "PIG-xxx" */}
            <span>{formData.tag || "No Tag"}</span>
          </DrawerTitle>
        </DrawerHeader>

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
            <FeedForm pigId={formData.pigId} /> {/* Pass pigId as a prop */}
          </TabsContent>
        </Tabs>

        <DrawerFooter className="-mx-6 -mb-2 gap-2 px-6">
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
