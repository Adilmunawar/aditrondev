
import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

interface CountrySelectProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  className?: string;
}

export const CountrySelect = ({ selectedCountry, onSelect, className }: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Comprehensive list of countries with dial codes and flags
    const countryList: Country[] = [
      { name: "Pakistan", code: "PK", dial_code: "+92", flag: "🇵🇰" },
      { name: "United States", code: "US", dial_code: "+1", flag: "🇺🇸" },
      { name: "United Kingdom", code: "GB", dial_code: "+44", flag: "🇬🇧" },
      { name: "India", code: "IN", dial_code: "+91", flag: "🇮🇳" },
      { name: "China", code: "CN", dial_code: "+86", flag: "🇨🇳" },
      { name: "Canada", code: "CA", dial_code: "+1", flag: "🇨🇦" },
      { name: "Australia", code: "AU", dial_code: "+61", flag: "🇦🇺" },
      { name: "Germany", code: "DE", dial_code: "+49", flag: "🇩🇪" },
      { name: "France", code: "FR", dial_code: "+33", flag: "🇫🇷" },
      { name: "Japan", code: "JP", dial_code: "+81", flag: "🇯🇵" },
      { name: "Brazil", code: "BR", dial_code: "+55", flag: "🇧🇷" },
      { name: "Russia", code: "RU", dial_code: "+7", flag: "🇷🇺" },
      { name: "South Africa", code: "ZA", dial_code: "+27", flag: "🇿🇦" },
      { name: "Mexico", code: "MX", dial_code: "+52", flag: "🇲🇽" },
      { name: "South Korea", code: "KR", dial_code: "+82", flag: "🇰🇷" },
      { name: "Indonesia", code: "ID", dial_code: "+62", flag: "🇮🇩" },
      { name: "Turkey", code: "TR", dial_code: "+90", flag: "🇹🇷" },
      { name: "Italy", code: "IT", dial_code: "+39", flag: "🇮🇹" },
      { name: "Spain", code: "ES", dial_code: "+34", flag: "🇪🇸" },
      { name: "Netherlands", code: "NL", dial_code: "+31", flag: "🇳🇱" },
      { name: "Saudi Arabia", code: "SA", dial_code: "+966", flag: "🇸🇦" },
      { name: "UAE", code: "AE", dial_code: "+971", flag: "🇦🇪" },
      { name: "Malaysia", code: "MY", dial_code: "+60", flag: "🇲🇾" },
      { name: "Thailand", code: "TH", dial_code: "+66", flag: "🇹🇭" },
      { name: "Singapore", code: "SG", dial_code: "+65", flag: "🇸🇬" },
      { name: "Philippines", code: "PH", dial_code: "+63", flag: "🇵🇭" },
      { name: "Argentina", code: "AR", dial_code: "+54", flag: "🇦🇷" },
      { name: "Colombia", code: "CO", dial_code: "+57", flag: "🇨🇴" },
      { name: "Egypt", code: "EG", dial_code: "+20", flag: "🇪🇬" },
      { name: "Nigeria", code: "NG", dial_code: "+234", flag: "🇳🇬" },
      { name: "Kenya", code: "KE", dial_code: "+254", flag: "🇰🇪" },
      { name: "Ghana", code: "GH", dial_code: "+233", flag: "🇬🇭" },
      { name: "Vietnam", code: "VN", dial_code: "+84", flag: "🇻🇳" },
      { name: "New Zealand", code: "NZ", dial_code: "+64", flag: "🇳🇿" },
      { name: "Sweden", code: "SE", dial_code: "+46", flag: "🇸🇪" },
      { name: "Norway", code: "NO", dial_code: "+47", flag: "🇳🇴" },
      { name: "Denmark", code: "DK", dial_code: "+45", flag: "🇩🇰" },
      { name: "Finland", code: "FI", dial_code: "+358", flag: "🇫🇮" },
      { name: "Poland", code: "PL", dial_code: "+48", flag: "🇵🇱" },
      { name: "Switzerland", code: "CH", dial_code: "+41", flag: "🇨🇭" },
      { name: "Austria", code: "AT", dial_code: "+43", flag: "🇦🇹" },
      { name: "Belgium", code: "BE", dial_code: "+32", flag: "🇧🇪" },
      { name: "Greece", code: "GR", dial_code: "+30", flag: "🇬🇷" },
      { name: "Portugal", code: "PT", dial_code: "+351", flag: "🇵🇹" },
      { name: "Ireland", code: "IE", dial_code: "+353", flag: "🇮🇪" },
      { name: "Israel", code: "IL", dial_code: "+972", flag: "🇮🇱" },
      { name: "Qatar", code: "QA", dial_code: "+974", flag: "🇶🇦" },
      { name: "Kuwait", code: "KW", dial_code: "+965", flag: "🇰🇼" },
      { name: "Bahrain", code: "BH", dial_code: "+973", flag: "🇧🇭" },
      { name: "Oman", code: "OM", dial_code: "+968", flag: "🇴🇲" },
      { name: "Bangladesh", code: "BD", dial_code: "+880", flag: "🇧🇩" },
      { name: "Sri Lanka", code: "LK", dial_code: "+94", flag: "🇱🇰" },
      { name: "Nepal", code: "NP", dial_code: "+977", flag: "🇳🇵" },
      { name: "Myanmar", code: "MM", dial_code: "+95", flag: "🇲🇲" },
    ];
    setCountries(countryList);
  }, []);

  const filteredCountries = countries.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      country.dial_code.includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  });

  const handleSelect = (country: Country) => {
    onSelect(country);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center justify-between w-full px-3 py-6 text-left font-normal bg-transparent border-none shadow-none hover:bg-secondary/30 focus:ring-0",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="font-medium">{selectedCountry.dial_code}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder="Search country..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-none border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <ScrollArea className="h-[300px]">
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dial_code} ${country.code}`}
                    onSelect={() => handleSelect(country)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-xl">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-auto text-muted-foreground">{country.dial_code}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedCountry.code === country.code
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
