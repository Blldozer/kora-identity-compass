
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { saveSecurely, getSecurely, removeSecurely, clearSecureStorage } from '@/utils/secureStorage';
import { toast } from '@/components/ui/use-toast';

// Maximum number of login attempts before temporary lockout
const MAX_LOGIN_ATTEMPTS = 5;
// Lockout duration in milliseconds (15 minutes)
const LOCKOUT_DURATION = 15 * 60 * 1000;
// Session timeout in hours (default: 24 hours)
const SESSION_TIMEOUT = 24;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  // Check if the account is locked due to too many failed login attempts
  const checkAccountLock = useCallback(() => {
    const lockData = getSecurely('auth-lock');
    if (lockData) {
      const { attempts, timestamp } = JSON.parse(lockData);
      
      // Check if lock should be cleared (time has passed)
      if (timestamp + LOCKOUT_DURATION < Date.now()) {
        removeSecurely('auth-lock');
        setIsLocked(false);
        return false;
      }
      
      // Account is locked if max attempts reached
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        setIsLocked(true);
        return true;
      }
    }
    
    setIsLocked(false);
    return false;
  }, []);

  // Record a failed login attempt
  const recordFailedAttempt = useCallback(() => {
    const lockData = getSecurely('auth-lock');
    let attempts = 1;
    
    if (lockData) {
      const data = JSON.parse(lockData);
      attempts = data.attempts + 1;
    }
    
    saveSecurely('auth-lock', JSON.stringify({
      attempts,
      timestamp: Date.now()
    }));
    
    // Check if this attempt caused a lockout
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      setIsLocked(true);
      
      // Show lockout message
      toast({
        title: "Account Temporarily Locked",
        description: "Too many failed login attempts. Please try again in 15 minutes.",
        variant: "destructive"
      });
    }
  }, []);

  // Reset failed login attempts after successful login
  const resetFailedAttempts = useCallback(() => {
    removeSecurely('auth-lock');
    setIsLocked(false);
  }, []);

  useEffect(() => {
    // Check account lock status on mount
    checkAccountLock();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Store session securely when logging in
        if (event === 'SIGNED_IN' && session) {
          saveSecurely('user-session', JSON.stringify(session), SESSION_TIMEOUT);
          resetFailedAttempts();
        }
        
        // Remove session when logging out
        if (event === 'SIGNED_OUT') {
          removeSecurely('user-session');
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      // First check if there's a cached session
      const cachedSession = getSecurely('user-session');
      
      // If there's a cached session, use it to avoid unnecessary API calls
      if (cachedSession) {
        try {
          const parsedSession = JSON.parse(cachedSession);
          setSession(parsedSession);
          setUser(parsedSession.user);
        } catch (e) {
          console.error('Error parsing cached session:', e);
        }
      }
      
      // Then validate with Supabase
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      
      // Update cached session if valid
      if (data.session) {
        saveSecurely('user-session', JSON.stringify(data.session), SESSION_TIMEOUT);
      } else {
        removeSecurely('user-session');
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAccountLock, resetFailedAttempts]);

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
    // Check if account is locked
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
      // Record failed attempt
      recordFailedAttempt();
      return { data, error };
    }
    
    // Reset failed attempts on successful login
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
    
    if (!error) {
      // Update cached session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        saveSecurely('user-session', JSON.stringify(sessionData.session), SESSION_TIMEOUT);
      }
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

  // Securely clear all auth data (for account deletion or security events)
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
