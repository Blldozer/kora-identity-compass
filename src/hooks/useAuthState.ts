
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from './useAuthSession';
import { useAuthLockout } from './useAuthLockout';
import { AuthResult } from '@/types/auth';

export const useAuthState = () => {
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

  return {
    user,
    session,
    loading,
    isLocked,
    checkAccountLock,
    recordFailedAttempt,
    resetFailedAttempts,
    checkUserProfile,
    updateSession,
    checkCachedSession,
    refreshSession,
    setLoading
  };
};
