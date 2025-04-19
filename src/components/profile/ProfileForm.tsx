
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { profileFormSchema, type ProfileFormValues } from '@/lib/validations/profile';

interface ProfileFormProps {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const ProfileForm = ({
  email,
  firstName,
  lastName,
  phoneNumber,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onSave,
  saving
}: ProfileFormProps) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName,
      lastName,
      phoneNumber,
      email,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    onFirstNameChange(data.firstName);
    onLastNameChange(data.lastName);
    onPhoneChange(data.phoneNumber);
    onSave();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <FormLabel>First Name</FormLabel>
                </div>
                <FormControl>
                  <Input 
                    placeholder="Enter your first name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <FormLabel>Last Name</FormLabel>
                </div>
                <FormControl>
                  <Input 
                    placeholder="Enter your last name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <FormLabel>Email</FormLabel>
              </div>
              <FormControl>
                <Input
                  {...field}
                  disabled
                  className="bg-gray-100"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">You cannot change your email address</p>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <FormLabel>Phone Number</FormLabel>
              </div>
              <FormControl>
                <Input 
                  placeholder="Enter your phone number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          className="w-full flex items-center gap-2 justify-center" 
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Form>
  );
};
