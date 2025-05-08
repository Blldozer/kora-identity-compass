
import { Session } from '@supabase/supabase-js';
import { saveSecurely, getSecurely, removeSecurely } from '@/utils/secureStorage';
import { SESSION_TIMEOUT } from '@/constants/auth';

/**
 * Hook for managing session storage operations
 */
export const useSessionStorage = () => {
  /**
   * Save session data to secure storage
   */
  const saveSession = (session: Session | null) => {
    if (session) {
      saveSecurely('user-session', JSON.stringify(session), SESSION_TIMEOUT);
    } else {
      removeSecurely('user-session');
    }
  };

  /**
   * Retrieve session data from secure storage
   */
  const getSession = (): Session | null => {
    const cachedSession = getSecurely('user-session');
    
    if (!cachedSession) {
      return null;
    }
    
    try {
      return JSON.parse(cachedSession) as Session;
    } catch (e) {
      console.error('Error parsing cached session:', e);
      removeSecurely('user-session');
      return null;
    }
  };

  /**
   * Check if a session is valid/not expired
   */
  const isSessionValid = (session: Session | null): boolean => {
    if (!session?.expires_at) {
      return false;
    }
    
    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    
    return expiresAt > now;
  };

  return {
    saveSession,
    getSession,
    isSessionValid
  };
};
