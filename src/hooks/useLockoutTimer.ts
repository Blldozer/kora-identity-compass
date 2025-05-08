
import { useState, useEffect } from 'react';

export const useLockoutTimer = (isLocked: boolean) => {
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    if (isLocked) {
      const lockData = localStorage.getItem('kora-auth-lock');
      if (lockData) {
        try {
          const decryptValue = (val: string) => {
            try {
              return atob(val);
            } catch (e) {
              console.error('Error decoding lockout data:', e);
              return null;
            }
          };
          
          const decrypted = decryptValue(lockData);
          if (decrypted) {
            const { timestamp } = JSON.parse(JSON.parse(decrypted).value);
            const updateTimer = () => {
              const elapsed = Date.now() - timestamp;
              const lockoutDuration = 15 * 60 * 1000; // 15 minutes
              const remaining = Math.max(0, lockoutDuration - elapsed);
              
              if (remaining <= 0) {
                setLockoutRemaining(null);
                window.location.reload();
                return;
              }
              
              setLockoutRemaining(Math.ceil(remaining / 60000));
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 60000);
            return () => clearInterval(interval);
          }
        } catch (e) {
          console.error('Error parsing lockout data:', e);
        }
      }
    }
  }, [isLocked]);

  return lockoutRemaining;
};
