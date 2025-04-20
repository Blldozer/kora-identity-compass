
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  const fetchProfile = async (id: string) => {
    try {
      // Use maybeSingle instead of single to handle case when no profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      } else {
        // If no profile exists, create one with minimal data
        console.log('No profile found, creating a new one...');
        const { data: userData, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        // Create a new profile with the required id property
        try {
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: id,
              email: userData.user?.email || null
            })
            .select()
            .single();
            
          if (createError) {
            // Handle potential unique constraint violation
            if (createError.code === '23505') {
              toast({
                title: 'Profile Creation Error',
                description: 'A profile with this email already exists.',
                variant: 'destructive'
              });
              return;
            }
            throw createError;
          }
          
          setProfile(createdProfile);
        } catch (insertError) {
          console.error('Error inserting profile:', insertError);
          toast({
            title: "Error",
            description: "Failed to create profile",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return null;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!userId) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refreshProfile: () => userId && fetchProfile(userId)
  };
}
