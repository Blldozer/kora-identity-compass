
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
      setLoading(true);
      
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
              console.log("Cached session is valid");
              setSession(parsedSession);
              setUser(parsedSession.user);
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
      
      // Always get the latest session from Supabase
      console.log("Getting current session from Supabase");
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log("Supabase session check:", session ? "Session exists" : "No session");
      updateSession(session);
      
      return { data: session, error: null };
    } catch (error: any) {
      console.error('Error checking session:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to check session',
          code: error.code
        }
      };
    } finally {
      setLoading(false);
    }
  }, [updateSession]);

  // Clear expired session on component mount
  useEffect(() => {
    const clearExpiredSession = () => {
      const cachedSession = getSecurely('user-session');
      if (cachedSession) {
        try {
          const parsedSession = JSON.parse(cachedSession);
          if (parsedSession.expires_at) {
            const expiresAt = parsedSession.expires_at * 1000;
            const now = Date.now();
            
            if (expiresAt <= now) {
              console.log("Removing expired cached session on mount");
              removeSecurely('user-session');
            }
          }
        } catch (e) {
          console.error('Error parsing cached session:', e);
          removeSecurely('user-session');
        }
      }
    };
    
    clearExpiredSession();
  }, []);

  return {
    user,
    session,
    loading,
    updateSession,
    checkCachedSession,
    setLoading
  };
};
