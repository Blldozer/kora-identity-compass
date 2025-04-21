import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { CountrySelect } from './CountrySelect';
import { useRegistrationValidation } from '@/hooks/useRegistrationValidation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerFormSchema, type RegisterFormValues } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const RegisterForm = () => {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const { isChecking, emailExists, phoneExists, validateField } = useRegistrationValidation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '',
      phoneNumber: '',
      country: '',
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'email' && value.email) {
        validateField('email', value.email);
      }
      if (name === 'phoneNumber' && value.phoneNumber && value.countryCode) {
        const fullPhone = `+${value.countryCode}${value.phoneNumber}`;
        validateField('phone', fullPhone);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, validateField]);

  useEffect(() => {
    if (emailExists) {
      form.setError('email', {
        type: 'manual',
        message: 'This email is already registered. Please try logging in instead.'
      });
    }

    if (phoneExists) {
      form.setError('phoneNumber', {
        type: 'manual',
        message: 'This phone number is already registered.'
      });
    }
  }, [emailExists, phoneExists, form.setError]);

  const onSubmit = async (data: RegisterFormValues) => {
    const fullPhoneNumber = `+${data.countryCode}${data.phoneNumber}`;
    const { error } = await signUp(data.email, data.password, {
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: fullPhoneNumber,
      country: data.country
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        form.setError('email', {
          type: 'manual',
          message: 'This email is already registered. Please try logging in instead.'
        });
      } else if (error.message.includes('Phone number is already registered')) {
        form.setError('phoneNumber', {
          type: 'manual',
          message: 'This phone number is already registered.'
        });
      } else if (error.message.includes('phone')) {
        form.setError('phoneNumber', {
          type: 'manual',
          message: 'This phone number is already in use.'
        });
      } else {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive"
        });
      }
      return;
    }

    toast({
      title: "Registration Successful",
      description: "Please log in with your credentials"
    });
    navigate('/login');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="email" 
                    {...field} 
                    className={isChecking ? 'pr-8' : ''} 
                  />
                  {isChecking && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <span className="animate-spin">⌛</span>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <CountrySelect
            form={form}
            name="countryCode"
            label="Country Code"
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <CountrySelect
          form={form}
          name="country"
          label="Country"
        />

        <div className="space-y-4">
          <PasswordInput 
            form={form} 
            name="password" 
            label="Password" 
          />
          <PasswordStrength password={form.watch('password')} />
        </div>

        <PasswordInput 
          form={form} 
          name="confirmPassword" 
          label="Confirm Password" 
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </Button>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>
      </form>
    </Form>
  );
};
