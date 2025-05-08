
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';
import { useSignUp } from './useSignUp';
import { useGoogleAuth } from './useGoogleAuth';
import { usePasswordAuth } from './usePasswordAuth';
import { clearSecureStorage } from '@/utils/secureStorage';

export const useAuth = () => {
  const { 
    user,
    session,
    loading,
    isLocked,
    checkAccountLock,
    resetFailedAttempts,
    checkUserProfile,
    updateSession,
    checkCachedSession,
    refreshSession
  } = useAuthState();

  const { signIn, signOut } = useAuthActions();
  const { signUp } = useSignUp();
  const { signInWithGoogle } = useGoogleAuth();
  const { resetPassword, updatePassword } = usePasswordAuth();

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
  }, [checkAccountLock, resetFailedAttempts, updateSession, checkCachedSession, checkUserProfile]);

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
