
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Profile } from "@/hooks/useProfile";

export async function fetchProfileById(id: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) {
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      return createInitialProfile(id, userData.user?.email);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    toast({
      title: "Error",
      description: "Failed to fetch profile",
      variant: "destructive"
    });
    return null;
  }
}

export async function createInitialProfile(id: string, email: string | undefined): Promise<Profile | null> {
  try {
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: id,
        email: email || null
      })
      .select()
      .single();
      
    if (createError) {
      if (createError.code === '23505') {
        toast({
          title: 'Profile Creation Error',
          description: 'A profile with this email already exists.',
          variant: 'destructive'
        });
        return null;
      }
      throw createError;
    }
    
    return createdProfile;
  } catch (error) {
    console.error('Error creating profile:', error);
    toast({
      title: "Error",
      description: "Failed to create profile",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateProfileData(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
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
}
