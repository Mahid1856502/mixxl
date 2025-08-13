import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SUPPORTED_CURRENCIES, getCurrencySymbol, getCurrencyFlag } from "@/lib/currency";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CurrencySelector({ value, onValueChange, placeholder = "Select currency...", className }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCurrency = SUPPORTED_CURRENCIES.find(currency => currency.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedCurrency ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCurrencyFlag(selectedCurrency.code)}</span>
              <span>{getCurrencySymbol(selectedCurrency.code)} {selectedCurrency.code}</span>
              <span className="text-gray-500">- {selectedCurrency.name}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 max-h-[300px] overflow-y-auto">
        <Command>
          <CommandInput placeholder="Search currencies..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <CommandItem
                key={currency.code}
                value={`${currency.code} ${currency.name}`}
                onSelect={() => {
                  onValueChange(currency.code);
                  setOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2"
              >
                <span className="text-lg">{currency.flag}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol} {currency.code}</span>
                  <span className="text-gray-500">- {currency.name}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === currency.code ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}