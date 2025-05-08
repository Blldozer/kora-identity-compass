
import { useState, useCallback, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { AuthResult } from '@/types/auth';
import { useSessionStorage } from './useSessionStorage';
import { useSessionRefresh } from './useSessionRefresh';
import { removeSecurely } from '@/utils/secureStorage';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { saveSession, getSession, isSessionValid } = useSessionStorage();
  const { getCurrentSession, refreshSession } = useSessionRefresh();

  const updateSession = useCallback((newSession: Session | null) => {
    console.log("Updating session:", newSession ? "Session exists" : "No session");
    
    if (newSession && !isSessionValid(newSession)) {
      console.log("Session has expired, clearing");
      setSession(null);
      setUser(null);
      removeSecurely('user-session');
      return;
    }
    
    setSession(newSession);
    setUser(newSession?.user ?? null);
    saveSession(newSession);
  }, [isSessionValid, saveSession]);

  const checkCachedSession = useCallback(async (): Promise<AuthResult<Session>> => {
    try {
      console.log("Checking cached session");
      
      // Try to get session from Supabase first
      const supabaseSessionResult = await getCurrentSession();
      
      if (supabaseSessionResult.data) {
        updateSession(supabaseSessionResult.data);
        setLoading(false);
        return supabaseSessionResult;
      }
      
      // If no Supabase session, check cached session
      const cachedSession = getSession();
      
      if (cachedSession && isSessionValid(cachedSession)) {
        console.log("Found valid cached session, attempting to refresh");
        
        // Try to refresh the session
        const refreshResult = await refreshSession();
        
        if (refreshResult.data) {
          console.log("Session refreshed successfully");
          updateSession(refreshResult.data);
          setLoading(false);
          return refreshResult;
        } else {
          console.log("Session refresh failed, clearing cached session");
          removeSecurely('user-session');
        }
      } else if (cachedSession) {
        console.log("Cached session is expired or invalid");
        removeSecurely('user-session');
      }
      
      // No valid session found
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
  }, [getCurrentSession, getSession, isSessionValid, refreshSession, updateSession]);

  return {
    user,
    session,
    loading,
    updateSession,
    checkCachedSession,
    setLoading
  };
};
