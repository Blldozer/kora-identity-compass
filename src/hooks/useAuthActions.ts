
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from './useAuthState';
import { AuthResult } from '@/types/auth';
import { clearSecureStorage } from '@/utils/secureStorage';

export const useAuthActions = () => {
  const { 
    checkAccountLock, 
    recordFailedAttempt, 
    resetFailedAttempts, 
    checkUserProfile, 
    setLoading 
  } = useAuthState();

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (checkAccountLock()) {
      return {
        data: null,
        error: {
          message: 'Too many failed login attempts. Please try again in 15 minutes.',
          code: 'ACCOUNT_LOCKED'
        }
      };
    }

    setLoading(true);
    try {
      console.log("Attempting sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        recordFailedAttempt();
        return { 
          data: null, 
          error: {
            message: error.message,
            code: error.status?.toString()
          }
        };
      }
      
      console.log("Sign in successful:", data.user?.id);
      resetFailedAttempts();
      
      // Check if profile exists immediately to avoid race conditions
      if (data.user) {
        await checkUserProfile(data.user.id);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error("Unexpected sign in error:", error);
      return {
        data: null,
        error: {
          message: error.message || 'An error occurred during login',
          code: error.code
        }
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<AuthResult> => {
    setLoading(true);
    try {
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearSecureStorage();
      return { data: true, error: null };
    } catch (error: any) {
      console.error("Sign out error:", error);
      return {
        data: null,
        error: {
          message: error.message || 'An error occurred during sign out',
          code: error.code
        }
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signOut
  };
};
