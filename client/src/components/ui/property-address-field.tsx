import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Control } from "react-hook-form";

interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  purchaseDate?: string | null;
  estimatedValue?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
}

interface PropertyAddressFieldProps {
  control: Control<PropertyFormData>;
  setValue: (name: keyof PropertyFormData, value: string) => void;
}

export function PropertyAddressField({ control, setValue }: PropertyAddressFieldProps) {
  return (
    <FormField
      control={control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Street Address</FormLabel>
          <FormControl>
            <AddressAutocomplete
              value={field.value}
              onChange={field.onChange}
              placeholder="Start typing your address..."
              onAddressSelect={(address) => {
                // Auto-fill other form fields when address is selected
                const streetAddress = `${address.street_number || ''} ${address.route || ''}`.trim();
                if (streetAddress) {
                  setValue('address', streetAddress);
                }
                if (address.city) {
                  setValue('city', address.city);
                }
                if (address.state) {
                  setValue('state', address.state);
                }
                if (address.postal_code) {
                  setValue('zipCode', address.postal_code);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}