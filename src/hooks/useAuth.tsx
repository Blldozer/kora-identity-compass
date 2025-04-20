
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthLockout } from './useAuthLockout';
import { useAuthSession } from './useAuthSession';
import { clearSecureStorage } from '@/utils/secureStorage';

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

  const signUp = async (email: string, password: string, metadata?: object) => {
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
          message: error.message || 'An error occurred during registration' 
        }
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (checkAccountLock()) {
      return {
        data: null,
        error: {
          message: 'Too many failed login attempts. Please try again in 15 minutes.'
        }
      };
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    setLoading(false);
    
    if (error) {
      recordFailedAttempt();
      return { data, error };
    }
    
    resetFailedAttempts();
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    removeSecurely('user-session');
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (!error && data.user) {
      const { data: sessionData } = await supabase.auth.getSession();
      updateSession(sessionData.session);
    }
    
    return { data, error };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    setLoading(false);
    return { error };
  };

  const clearAuthData = async () => {
    await signOut();
    clearSecureStorage();
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
    clearAuthData
  };
};
