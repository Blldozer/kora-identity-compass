
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { User } from 'lucide-react';

const ProfileSetup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { user, refreshSession } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        console.log("No user found in profile setup");
        setInitializing(false);
        return;
      }
      
      try {
        console.log("Loading user data for profile setup");
        // Try to get existing profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          console.log("Found existing profile data");
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
        } else {
          console.log("No profile found, checking user metadata");
          // Check if we have data in user metadata
          const metadata = user.user_metadata || {};
          setFirstName(metadata.first_name || '');
          setLastName(metadata.last_name || '');
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setInitializing(false);
      }
    };
    
    loadUserData();
  }, [user]);

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error("No user found when trying to save profile");
      toast({
        title: "Error",
        description: "You must be logged in to setup your profile",
        variant: "destructive"
      });
      
      // Attempt to refresh session
      await refreshSession();
      if (!user) {
        navigate('/login');
      }
      return;
    }

    setLoading(true);
    
    try {
      console.log("Setting up profile for user:", user.id);
      
      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          first_name: firstName, 
          last_name: lastName 
        }
      });

      if (updateError) throw updateError;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        console.log("Updating existing profile");
        // Update existing profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      } else {
        console.log("Creating new profile");
        // Create new profile
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName
          });

        if (createError) throw createError;
      }

      await refreshSession();
      
      toast({
        title: "Profile Setup Complete",
        description: "Welcome to Kora!"
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Profile setup error:", error);
      toast({
        title: "Profile Setup Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-2 w-24 bg-gradient-to-r from-orange-500 to-blue-600 rounded mb-3"></div>
          <p className="text-gray-500">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h2>
        <form onSubmit={handleProfileSetup} className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="firstName" className="text-base">First Name</Label>
            </div>
            <Input 
              type="text" 
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
              placeholder="Enter your first name"
              className="p-3 h-12 text-base"
              autoComplete="given-name"
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="lastName" className="text-base">Last Name</Label>
            </div>
            <Input 
              type="text" 
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
              placeholder="Enter your last name"
              className="p-3 h-12 text-base"
              autoComplete="family-name"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full p-6 text-base mt-6"
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
