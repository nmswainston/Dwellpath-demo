import { useState, useRef, useEffect, useId } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Search } from "lucide-react";

interface AddressSuggestion {
  description: string;
  street_number?: string;
  route?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  /**
   * Optional stable identifier for the underlying input.
   * If omitted, a unique id is generated to satisfy browser autofill/a11y audits.
   */
  id?: string;
  /**
   * Optional name attribute for the underlying input (useful when the component
   * is used inside a native <form> submit flow).
   */
  name?: string;
}

// Mock address suggestions for demo purposes
// In production, this would be replaced with Google Places API calls
const getMockAddressSuggestions = (query: string): AddressSuggestion[] => {
  if (query.length < 3) return [];
  
  const mockSuggestions: AddressSuggestion[] = [
    {
      description: "123 Main Street, Miami, FL 33101, USA",
      street_number: "123",
      route: "Main Street",
      city: "Miami",
      state: "FL",
      postal_code: "33101",
      country: "USA"
    },
    {
      description: "456 Ocean Drive, Miami Beach, FL 33139, USA",
      street_number: "456",
      route: "Ocean Drive",
      city: "Miami Beach",
      state: "FL",
      postal_code: "33139",
      country: "USA"
    },
    {
      description: "789 Park Avenue, New York, NY 10021, USA",
      street_number: "789",
      route: "Park Avenue",
      city: "New York",
      state: "NY",
      postal_code: "10021",
      country: "USA"
    },
    {
      description: "101 California Street, San Francisco, CA 94111, USA",
      street_number: "101",
      route: "California Street",
      city: "San Francisco",
      state: "CA",
      postal_code: "94111",
      country: "USA"
    }
  ];

  return mockSuggestions.filter(suggestion =>
    suggestion.description.toLowerCase().includes(query.toLowerCase())
  );
};

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address...",
  className,
  id,
  name,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const reactId = useId();
  const inputId = id ?? `address-autocomplete-${reactId.replace(/:/g, "")}`;
  const searchId = `${inputId}-search`;

  useEffect(() => {
    if (value.length >= 3) {
      setIsLoading(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        setSuggestions(getMockAddressSuggestions(value));
        setIsLoading(false);
        setOpen(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [value]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description);
    onAddressSelect?.(suggestion);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.length < 3) {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              id={inputId}
              name={name}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`pl-10 ${className}`}
              autoComplete="street-address"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start" side="bottom">
          <Command>
            <CommandInput 
              id={searchId}
              placeholder="Search addresses..." 
              value={value}
              onValueChange={handleInputChange}
              className="border-none focus:ring-0"
            />
            <CommandList>
              {isLoading && (
                <CommandEmpty>
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Searching addresses...</span>
                  </div>
                </CommandEmpty>
              )}
              {!isLoading && suggestions.length === 0 && value.length >= 3 && (
                <CommandEmpty>
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    No addresses found. Try a different search.
                  </div>
                </CommandEmpty>
              )}
              {!isLoading && suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      value={suggestion.description}
                      onSelect={() => handleSelect(suggestion)}
                      className="flex items-start space-x-3 p-3 cursor-pointer"
                    >
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {suggestion.description}
                        </p>
                        {suggestion.city && suggestion.state && (
                          <p className="text-xs text-muted-foreground">
                            {suggestion.city}, {suggestion.state} {suggestion.postal_code}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}