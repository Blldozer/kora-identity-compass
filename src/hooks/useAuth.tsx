
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthLockout } from './useAuthLockout';
import { useAuthSession } from './useAuthSession';
import { useSignUp } from './useSignUp';
import { useGoogleAuth } from './useGoogleAuth';
import { usePasswordAuth } from './usePasswordAuth';
import { clearSecureStorage } from '@/utils/secureStorage';
import { AuthResult } from '@/types/auth';

export const useAuth = () => {
  const { 
    isLocked, 
    checkAccountLock, 
    recordFailedAttempt, 
    resetFailedAttempts 
  } = useAuthLockout();
  
  const {
    user,
    session,
    loading,
    updateSession,
    checkCachedSession,
    setLoading
  } = useAuthSession();

  const { signUp } = useSignUp();
  const { signInWithGoogle } = useGoogleAuth();
  const { resetPassword, updatePassword } = usePasswordAuth();

  useEffect(() => {
    checkAccountLock();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        updateSession(session);
        
        if (event === 'SIGNED_IN') {
          resetFailedAttempts();
        }
      }
    );

    checkCachedSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAccountLock, resetFailedAttempts, updateSession, checkCachedSession]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        recordFailedAttempt();
        return { 
          data: null, 
          error: {
            message: error.message,
            code: error.status?.toString()
          }
        };
      }
      
      // Check if profile exists and create one if it doesn't
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (!profileData && !profileError) {
          // Create a profile for the user if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              first_name: data.user.user_metadata?.first_name || '',
              last_name: data.user.user_metadata?.last_name || '',
              phone: data.user.user_metadata?.phone_number || ''
            });
            
          if (insertError) {
            console.error('Error creating missing profile:', insertError);
          }
        }
      }
      
      resetFailedAttempts();
      return { data, error: null };
    } catch (error: any) {
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearSecureStorage();
      return { data: true, error: null };
    } catch (error: any) {
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
    user,
    session,
    loading,
    isLocked,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
  };
};
