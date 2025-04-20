
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { AuthResult } from '@/types/auth';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'An error occurred during Google sign in',
          code: error.code
        }
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading
  };
};
