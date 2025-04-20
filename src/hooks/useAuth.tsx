
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthLockout } from './useAuthLockout';
import { useAuthSession } from './useAuthSession';
import { clearSecureStorage } from '@/utils/secureStorage';
import { AuthResult, SignUpMetadata } from '@/types/auth';

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

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
