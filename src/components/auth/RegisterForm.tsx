
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from './PasswordInput';
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

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const { error } = await signUp(data.email, data.password, {
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        form.setError('email', {
          type: 'manual',
          message: 'This email is already registered. Please try logging in instead.'
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
      description: "Please check your email to confirm your account"
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
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="+12345678901"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordInput 
          form={form} 
          name="password" 
          label="Password" 
        />

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
