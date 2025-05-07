
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { AuthResult, SignUpMetadata } from '@/types/auth';

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: SignUpMetadata
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Ensure metadata has required fields to prevent profile creation issues
      const safeMetadata = {
        first_name: '',
        last_name: '',
        phone_number: '',
        ...metadata
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: safeMetadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message.includes('unique constraint')) {
          throw new Error('This user already exists. Please try logging in instead.');
        }
        throw error;
      }

      // Double check that profile was created by the trigger, otherwise create it manually
      if (data?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (!profileData) {
          // Create profile manually if trigger didn't work
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              first_name: safeMetadata.first_name || '',
              last_name: safeMetadata.last_name || '',
              phone: safeMetadata.phone_number || ''
            })
            .single();
        }
      }

      return { data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: { 
          message: error.message || 'An error occurred during registration',
          code: error.code
        }
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    loading
  };
};
