
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthPasswordInput } from '@/components/auth/AuthPasswordInput';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, isLocked } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [loginAttempts, setLoginAttempts] = useState(0);

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
    
    setLoginAttempts(prev => prev + 1);
    console.log(`Login attempt ${loginAttempts + 1} for ${email}`);
    
    const { data, error } = await signIn(email, password);
    
    if (error) {
      console.error("Login error:", error);
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email before logging in.";
      }
      
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    if (data?.user) {
      console.log("Login successful for user:", data.user.id);
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
      
      // Check if we came from somewhere specific
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <Label htmlFor="email" className="text-base">Email</Label>
        <div className="relative flex items-center">
          {!email && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <Input 
            type="email" 
            id="email"
            className={`p-3 text-base h-12 email-placeholder-shifted input-left-cursor ${email ? 'pl-4' : 'pl-10'} pr-4`}
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
  );
};
