
import React from 'react';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { countries } from '@/lib/countries';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormValues } from '@/lib/validations/auth';

interface CountrySelectProps {
  form: UseFormReturn<RegisterFormValues>;
  name: 'countryCode' | 'country';
  label: string;
}

export const CountrySelect = ({ form, name, label }: CountrySelectProps) => {
  // Helper to find the selected country by 3-letter code
  const selectedCountry = countries.find(
    (country) => country.code === form.watch(name)
  );

  // Placeholder rendering for better UX, with flag for countryCode picker
  const renderPlaceholder = () => {
    if (name === 'countryCode') {
      return (
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="text-lg">🏳️</span>
          <span>Select country code</span>
        </span>
      );
    }
    return <span>Select country</span>;
  };

  // Handle different display for trigger value
  const renderTriggerValue = () => {
    if (!selectedCountry) {
      return renderPlaceholder();
    }
    return (
      <span className="flex items-center gap-2">
        <span className="text-lg">{selectedCountry.flag}</span>
        <span>
          {name === 'countryCode'
            ? `+${selectedCountry.phone} ${selectedCountry.name}`
            : selectedCountry.name}
        </span>
      </span>
    );
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                {renderTriggerValue()}
              </SelectTrigger>
              <SelectContent>
                <Command>
                  <CommandInput placeholder="Search countries..." />
                  <CommandList>
                    <CommandEmpty>No countries found.</CommandEmpty>
                    <CommandGroup>
                      {countries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.code}
                          onSelect={() => field.onChange(country.code)}
                          className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span>
                            {name === 'countryCode'
                              ? `+${country.phone} ${country.name}`
                              : country.name}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

