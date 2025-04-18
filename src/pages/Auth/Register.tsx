
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Registration Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    if (data.user) {
      toast({
        title: "Registration Successful",
        description: "Please complete your profile"
      });
      navigate('/profile-setup');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register for Kora</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Enter your email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Enter your password"
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              type="password" 
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              placeholder="Confirm your password"
              minLength={8}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <div className="text-center mt-4">
          <p>
            Already have an account? 
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
