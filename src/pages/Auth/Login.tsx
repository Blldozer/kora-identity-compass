
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { LockoutAlert } from '@/components/auth/LockoutAlert';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginSeparator } from '@/components/auth/LoginSeparator';
import { RegisterLink } from '@/components/auth/RegisterLink';
import { useLockoutTimer } from '@/hooks/useLockoutTimer';

const Login = () => {
  const { signInWithGoogle, isLocked } = useAuth();
  const lockoutRemaining = useLockoutTimer(isLocked);

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
