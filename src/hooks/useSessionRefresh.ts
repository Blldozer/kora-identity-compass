
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthResult } from '@/types/auth';
import { useCallback } from 'react';

/**
 * Hook for handling session refresh operations
 */
export const useSessionRefresh = () => {
  /**
   * Get the current session from Supabase
   */
  const getCurrentSession = useCallback(async (): Promise<AuthResult<Session>> => {
    try {
      console.log("Getting current session from Supabase");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session from Supabase:", error);
        throw error;
      }
      
      console.log("Supabase session check:", session ? "Session exists" : "No session");
      return { data: session, error: null };
    } catch (error: any) {
      console.error('Error getting current session:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get current session',
          code: error.code
        }
      };
    }
  }, []);

  /**
   * Refresh the session if possible
   */
  const refreshSession = useCallback(async (): Promise<AuthResult<Session>> => {
    try {
      console.log("Attempting to refresh session");
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        throw error;
      }
      
      console.log("Session refresh result:", session ? "Session refreshed" : "No session after refresh");
      return { data: session, error: null };
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to refresh session',
          code: error.code
        }
      };
    }
  }, []);

  return {
    getCurrentSession,
    refreshSession
  };
};
