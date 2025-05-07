
import { useState, useCallback, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { saveSecurely, getSecurely, removeSecurely } from '@/utils/secureStorage';
import { SESSION_TIMEOUT } from '@/constants/auth';
import { AuthResult } from '@/types/auth';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateSession = useCallback((newSession: Session | null) => {
    console.log("Updating session:", newSession ? "Session exists" : "No session");
    
    if (newSession?.expires_at) {
      // Check if the session is expired
      const expiresAt = newSession.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (expiresAt <= now) {
        console.log("Session has expired, clearing");
        setSession(null);
        setUser(null);
        removeSecurely('user-session');
        return;
      }
    }
    
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    if (newSession) {
      saveSecurely('user-session', JSON.stringify(newSession), SESSION_TIMEOUT);
    } else {
      removeSecurely('user-session');
    }
  }, []);

  const checkCachedSession = useCallback(async (): Promise<AuthResult<Session>> => {
    try {
      console.log("Checking cached session");
      
      // Always get the latest session from Supabase first
      console.log("Getting current session from Supabase");
      const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session from Supabase:", error);
        throw error;
      }
      
      console.log("Supabase session check:", supabaseSession ? "Session exists" : "No session");
      
      // If we have a session from Supabase, use it
      if (supabaseSession) {
        updateSession(supabaseSession);
        setLoading(false);
        return { data: supabaseSession, error: null };
      }
      
      // If no session from Supabase, try the cached session
      const cachedSession = getSecurely('user-session');
      
      if (cachedSession) {
        try {
          const parsedSession = JSON.parse(cachedSession);
          console.log("Found cached session, checking if valid");
          
          // Check if the session is expired
          if (parsedSession.expires_at) {
            const expiresAt = parsedSession.expires_at * 1000; // Convert to milliseconds
            const now = Date.now();
            
            if (expiresAt > now) {
              console.log("Cached session is valid, attempting to refresh");
              
              // Session is valid but we couldn't get it from Supabase
              // This likely means it's stale. Try to refresh the auth manually
              try {
                const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
                if (refreshedSession) {
                  console.log("Session refreshed successfully");
                  updateSession(refreshedSession);
                  setLoading(false);
                  return { data: refreshedSession, error: null };
                } else {
                  console.log("Session refresh failed, clearing cached session");
                  removeSecurely('user-session');
                }
              } catch (refreshError) {
                console.error("Error refreshing session:", refreshError);
                removeSecurely('user-session');
              }
            } else {
              console.log("Cached session is expired");
              removeSecurely('user-session');
            }
          }
        } catch (e) {
          console.error('Error parsing cached session:', e);
          removeSecurely('user-session');
        }
      }
      
      // At this point, we have no valid session
      setLoading(false);
      setSession(null);
      setUser(null);
      return { data: null, error: null };
    } catch (error: any) {
      console.error('Error checking session:', error);
      setLoading(false);
      setSession(null);
      setUser(null);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to check session',
          code: error.code
        }
      };
    }
  }, [updateSession]);

  return {
    user,
    session,
    loading,
    updateSession,
    checkCachedSession,
    setLoading
  };
};
