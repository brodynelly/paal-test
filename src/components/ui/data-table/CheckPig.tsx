import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import api from "@/lib/axios"
import { useState } from "react"

type PigFormData = {
  pigId?: string  // user-defined
  farm: string
  barn: string
  stall: string
  breed: string
  age: string
  group: string
}

interface PigIdInputProps {
  value: string
  onChange: (value: string) => void
  onError: (error: string | null) => void
}
export function PigIdInput({ value, onChange, onError }: PigIdInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [hasError, setHasError] = useState(false);

  const checkPigIdExists = async (id: string) => {
    setIsChecking(true);
    try {
      // GET endpoint: Assumes your GET route is /api/pigs/:id and returns 404 if not found.
      await api.get(`/pigs/${id}`);
      // If we get here, the pig exists
      setHasError(true);
      onError("This Pig ID already exists.");
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Pig not found: valid pigId
        setHasError(false);
        onError(null);
      } else {
        // Other errors
        setHasError(false);
        onError("Error checking Pig ID");
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div>
      <Label className="font-medium">Pig ID</Label>
      <Input
        name="pigId"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          if (value) checkPigIdExists(value);
        }}
        placeholder="Enter a unique Pig ID"
        hasError={hasError}
      />
      {isChecking && <p className="text-sm text-gray-500">Checking...</p>}
    </div>
  );
}
