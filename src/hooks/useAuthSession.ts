
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { saveSecurely, getSecurely, removeSecurely } from '@/utils/secureStorage';
import { SESSION_TIMEOUT } from '@/constants/auth';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateSession = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    
    if (newSession) {
      saveSecurely('user-session', JSON.stringify(newSession), SESSION_TIMEOUT);
    } else {
      removeSecurely('user-session');
    }
  }, []);

  const checkCachedSession = useCallback(async () => {
    const cachedSession = getSecurely('user-session');
    
    if (cachedSession) {
      try {
        const parsedSession = JSON.parse(cachedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (e) {
        console.error('Error parsing cached session:', e);
      }
    }
    
    const { data } = await supabase.auth.getSession();
    updateSession(data.session);
    setLoading(false);
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
