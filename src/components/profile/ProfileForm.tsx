
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <FormLabel className="text-base">First Name</FormLabel>
                </div>
                <FormControl>
                  <Input 
                    placeholder="Enter your first name"
                    className="p-3 text-base"
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
                  <FormLabel className="text-base">Last Name</FormLabel>
                </div>
                <FormControl>
                  <Input 
                    placeholder="Enter your last name"
                    className="p-3 text-base"
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
                <FormLabel className="text-base">Email</FormLabel>
              </div>
              <FormControl>
                <Input
                  {...field}
                  disabled
                  className="bg-gray-100 p-3 text-base"
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
                <FormLabel className="text-base">Phone Number</FormLabel>
              </div>
              <FormControl>
                <Input 
                  placeholder="Enter your phone number"
                  className="p-3 text-base"
                  type={isMobile ? "tel" : "text"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          className="w-full flex items-center gap-2 justify-center p-6 text-base" 
          disabled={saving}
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Form>
  );
};
