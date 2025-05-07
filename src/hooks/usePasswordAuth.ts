
import { supabase } from "@/integrations/supabase/client";
import { AuthResult } from '@/types/auth';
import { useAuthSession } from './useAuthSession';

export const usePasswordAuth = () => {
  const { updateSession } = useAuthSession();

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'An error occurred while resetting password',
          code: error.code
        }
      };
    }
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        updateSession(sessionData.session);
      }
      
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'An error occurred while updating password',
          code: error.code
        }
      };
    }
  };

  return {
    resetPassword,
    updatePassword
  };
};
