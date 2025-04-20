
import { useState, useCallback } from 'react';
import { saveSecurely, getSecurely, removeSecurely } from '@/utils/secureStorage';
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION } from '@/constants/auth';
import { toast } from '@/components/ui/use-toast';

export const useAuthLockout = () => {
  const [isLocked, setIsLocked] = useState(false);

  const checkAccountLock = useCallback(() => {
    const lockData = getSecurely('auth-lock');
    if (lockData) {
      const { attempts, timestamp } = JSON.parse(lockData);
      
      if (timestamp + LOCKOUT_DURATION < Date.now()) {
        removeSecurely('auth-lock');
        setIsLocked(false);
        return false;
      }
      
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        setIsLocked(true);
        return true;
      }
    }
    
    setIsLocked(false);
    return false;
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const lockData = getSecurely('auth-lock');
    let attempts = 1;
    
    if (lockData) {
      const data = JSON.parse(lockData);
      attempts = data.attempts + 1;
    }
    
    saveSecurely('auth-lock', JSON.stringify({
      attempts,
      timestamp: Date.now()
    }));
    
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      setIsLocked(true);
      toast({
        title: "Account Temporarily Locked",
        description: "Too many failed login attempts. Please try again in 15 minutes.",
        variant: "destructive"
      });
    }
  }, []);

  const resetFailedAttempts = useCallback(() => {
    removeSecurely('auth-lock');
    setIsLocked(false);
  }, []);

  return {
    isLocked,
    checkAccountLock,
    recordFailedAttempt,
    resetFailedAttempts
  };
};
