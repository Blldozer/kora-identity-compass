
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
                {selectedCountry ? (
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span>
                      {name === 'countryCode'
                        ? `+${selectedCountry.phone}`
                        : selectedCountry.name}
                    </span>
                  </span>
                ) : (
                  <SelectValue placeholder="Select country" />
                )}
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span>
                        {name === 'countryCode'
                          ? `+${country.phone}`
                          : country.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
