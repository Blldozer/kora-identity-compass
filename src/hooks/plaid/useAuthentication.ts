
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";

export const useAuthentication = () => {
  const { user, session, refreshSession } = useAuth();

  // Create a method to ensure we have a valid session before making requests
  const ensureAuthenticatedRequest = useCallback(async () => {
    if (!user || !session) {
      console.log("No authenticated user or session");
      return false;
    }

    // Check if session is about to expire and refresh it if needed
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    
    if (expiresAt < fiveMinutesFromNow) {
      console.log("Session is about to expire, refreshing...");
      const newSession = await refreshSession();
      if (!newSession) {
        console.error("Failed to refresh session");
        return false;
      }
    }

    return true;
  }, [user, session, refreshSession]);

  // Function to get auth headers for all API calls
  const getAuthHeaders = useCallback(() => {
    // Always include the current auth token for each request
    if (!session || !session.access_token) {
      console.error("No valid auth token available");
      return {};
    }
    return {
      Authorization: `Bearer ${session.access_token}`
    };
  }, [session]);

  return { 
    user, 
    session, 
    refreshSession, 
    ensureAuthenticatedRequest, 
    getAuthHeaders 
  };
};
