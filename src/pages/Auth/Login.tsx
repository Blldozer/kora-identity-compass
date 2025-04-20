
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from '@/hooks/use-mobile';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { AuthPasswordInput } from '@/components/auth/AuthPasswordInput';
import { LockoutAlert } from '@/components/auth/LockoutAlert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, loading, isLocked } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast({
        title: "Login Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    const { data, error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    if (data?.user) {
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Kora</h2>
        
        <LockoutAlert remainingMinutes={lockoutRemaining} />
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-base">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                type="email" 
                id="email"
                className="pl-10 p-3 text-base h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="Enter your email"
                inputMode={isMobile ? "email" : undefined}
                disabled={isLocked || loading}
                autoComplete="username"
              />
            </div>
          </div>

          <AuthPasswordInput
            value={password}
            onChange={setPassword}
            disabled={isLocked || loading}
            onForgotPassword={() => navigate('/auth/forgot-password')}
          />

          <Button 
            type="submit" 
            className="w-full p-6 text-base"
            disabled={loading || isLocked}
          >
            {loading ? 'Logging in...' : isLocked ? 'Account Locked' : 'Login'}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500 text-sm">
            Or continue with
          </span>
        </div>

        <GoogleSignIn 
          onSignIn={handleGoogleLogin}
          disabled={loading || isLocked}
        />

        <div className="text-center mt-6">
          <p className="text-base">
            Don't have an account? 
            <Button 
              variant="link" 
              onClick={() => navigate('/register')}
              className="text-base"
              disabled={isLocked}
            >
              Register
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
