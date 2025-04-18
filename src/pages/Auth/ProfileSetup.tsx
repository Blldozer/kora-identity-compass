
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ProfileSetup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to setup your profile",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Update user metadata in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          first_name: firstName, 
          last_name: lastName 
        }
      });

      if (updateError) throw updateError;

      // Insert profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName
        });

      if (profileError) throw profileError;

      toast({
        title: "Profile Setup Complete",
        description: "Welcome to Kora!"
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Profile Setup Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
        <form onSubmit={handleProfileSetup} className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              type="text" 
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              type="text" 
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
              placeholder="Enter your last name"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Saving Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
