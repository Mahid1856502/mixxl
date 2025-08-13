import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  error?: string;
  label: string;
  id: string;
}

export function DatePicker({
  value,
  onChange,
  error,
  label,
  id,
}: DatePickerProps) {
  return (
    <div className="flex flex-col space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="w-full justify-start text-left bg-gray-800 border-gray-600 text-white"
            aria-invalid={error ? "true" : "false"}
          >
            {value
              ? value.toLocaleDateString(undefined, { dateStyle: "medium" })
              : "Select a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              if (date) onChange(date);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
