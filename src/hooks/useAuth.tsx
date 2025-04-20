import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { saveSecurely, getSecurely, removeSecurely } from '@/utils/secureStorage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Store session securely when logging in
        if (event === 'SIGNED_IN' && session) {
          saveSecurely('user-session', JSON.stringify(session));
        }
        
        // Remove session when logging out
        if (event === 'SIGNED_OUT') {
          removeSecurely('user-session');
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      // First check if there's a cached session
      const cachedSession = getSecurely('user-session');
      
      // If there's a cached session, use it to avoid unnecessary API calls
      if (cachedSession) {
        try {
          const parsedSession = JSON.parse(cachedSession);
          setSession(parsedSession);
          setUser(parsedSession.user);
        } catch (e) {
          console.error('Error parsing cached session:', e);
        }
      }
      
      // Then validate with Supabase
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      
      // Update cached session if valid
      if (data.session) {
        saveSecurely('user-session', JSON.stringify(data.session));
      } else {
        removeSecurely('user-session');
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: object) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { data, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    removeSecurely('user-session');
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    setLoading(false);
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword
  };
};
