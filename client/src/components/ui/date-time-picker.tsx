"use client";
import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value: Date | undefined | null;
  onChange: (date: Date | undefined | null) => void;
  label?: string;
  showTimePicker?: boolean; // optional prop to show/hide time picker
  enableDatesFrom?: Date; // new prop to disable past dates
}

export function DateTimePicker({
  value = null,
  onChange,
  showTimePicker = false,
  enableDatesFrom = new Date(),
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formatTime = (date: Date | undefined | null) =>
    date ? date.toLocaleTimeString("en-GB", { hour12: false }) : "";

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes, seconds] = e.target.value.split(":").map(Number);

    if (!value) return;

    const updated = new Date(value);
    updated.setHours(hours || 0, minutes || 0, seconds || 0);
    onChange(updated);
  };

  const isDateEnabled = (date: Date) => {
    return date >= enableDatesFrom;
  };

  return (
    <div
      className={`flex gap-4 items-center justify-between${
        !showTimePicker ? "w-full" : ""
      }`}
    >
      <div
        className={`flex flex-col gap-3 w-full ${
          !showTimePicker ? "flex-1" : ""
        }`}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`justify-between font-normal ${
                showTimePicker ? "w-40" : "w-full"
              }`}
            >
              {value ? value.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              captionLayout="dropdown"
              disabled={(date) => !isDateEnabled(date)} // disable past dates
              onSelect={(selectedDate) => {
                if (!selectedDate) return;

                const updated = new Date(selectedDate);
                if (value) {
                  updated.setHours(
                    value.getHours(),
                    value.getMinutes(),
                    value.getSeconds()
                  );
                }

                onChange(updated);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {showTimePicker && (
        <div className="flex flex-col gap-3 w-full">
          <Input
            type="time"
            step="1"
            value={formatTime(value)}
            onChange={handleTimeChange}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      )}
    </div>
  );
}
