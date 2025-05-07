
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { LockoutAlert } from '@/components/auth/LockoutAlert';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginSeparator } from '@/components/auth/LoginSeparator';
import { RegisterLink } from '@/components/auth/RegisterLink';

const Login = () => {
  const { signInWithGoogle, isLocked } = useAuth();
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

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Kora</h2>
        
        <LockoutAlert remainingMinutes={lockoutRemaining} />
        
        <LoginForm />

        <LoginSeparator />

        <GoogleSignIn 
          onSignIn={handleGoogleLogin}
          disabled={isLocked}
        />

        <RegisterLink disabled={isLocked} />
      </div>
    </div>
  );
};

export default Login;
