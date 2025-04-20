
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message.includes('unique constraint')) {
          throw new Error('This user already exists. Please try logging in instead.');
        }
        throw error;
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
