
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Mail, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle, loading, isLocked } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Track remaining lockout time
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  useEffect(() => {
    // If account is locked, calculate and display remaining time
    if (isLocked) {
      const lockData = localStorage.getItem('kora-auth-lock');
      if (lockData) {
        try {
          // Use getSecurely from useAuth hook implementation
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
              
              setLockoutRemaining(Math.ceil(remaining / 60000)); // Convert to minutes
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 60000); // Update every minute
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
        
        {isLocked && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Account temporarily locked due to multiple failed login attempts. 
              {lockoutRemaining !== null && (
                <span> Please try again in {lockoutRemaining} {lockoutRemaining === 1 ? 'minute' : 'minutes'}.</span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
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
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Button 
                variant="link" 
                className="p-0 h-auto text-base"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/auth/forgot-password');
                }}
                disabled={isLocked}
              >
                Forgot Password?
              </Button>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                type={showPassword ? "text" : "password"} 
                id="password"
                className="pl-10 pr-10 p-3 text-base h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="Enter your password"
                disabled={isLocked || loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
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

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 space-x-2"
          onClick={handleGoogleLogin}
          disabled={loading || isLocked}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Sign in with Google</span>
        </Button>

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
