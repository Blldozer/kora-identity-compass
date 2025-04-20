
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Mail, Key, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    if (data.user) {
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Kora</h2>
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
              />
              <button
                type="button"
                className="absolute right-3 top-3.5 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full p-6 text-base"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className="text-center mt-6">
          <p className="text-base">
            Don't have an account? 
            <Button 
              variant="link" 
              onClick={() => navigate('/register')}
              className="text-base"
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
