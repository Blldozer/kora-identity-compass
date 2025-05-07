
import { useEffect, useCallback } from 'react';
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

  const refreshSession = useCallback(async () => {
    try {
      console.log("Refreshing session manually");
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Refreshed session:", currentSession ? "Session exists" : "No session");
      updateSession(currentSession);
      return currentSession;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  }, [updateSession]);

  useEffect(() => {
    // Check account lockout status
    checkAccountLock();
    
    // Check for cached session immediately to prevent flash of unauthenticated state
    checkCachedSession().then(() => {
      console.log("Initial session check complete");
    });

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        
        // Important: this must be synchronous to prevent infinite loops
        updateSession(newSession);
        
        if (event === 'SIGNED_IN') {
          resetFailedAttempts();
          
          // Defer profile check to avoid auth state loops
          setTimeout(() => {
            if (newSession?.user) {
              checkUserProfile(newSession.user.id);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Clear any cached session data
          clearSecureStorage();
        }
      }
    );

    // Clean up listener
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAccountLock, resetFailedAttempts, updateSession, checkCachedSession]);

  // Check if user has a profile and create one if needed
  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (!profileData && !profileError) {
        console.log("Creating missing profile for user:", userId);
        // Get user details
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        
        // Create a profile for the user if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userData.user.email,
            first_name: userData.user.user_metadata?.first_name || '',
            last_name: userData.user.user_metadata?.last_name || '',
            phone: userData.user.user_metadata?.phone_number || ''
          });
          
        if (insertError) {
          console.error('Error creating missing profile:', insertError);
        }
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
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
    refreshSession
  };
};
