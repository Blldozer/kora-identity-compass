
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async () => {
    try {
      // For demo purposes, using a test account
      await signIn('test@example.com', 'password123');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  if (user) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Kora</h1>
        <p className="text-center text-muted-foreground mb-6">
          Welcome back! Please sign in to continue.
        </p>
        <button 
          onClick={handleLogin} 
          className="w-full bg-primary text-white p-3 rounded-md hover:bg-primary/90"
        >
          Sign In (Demo)
        </button>
      </div>
    </div>
  );
};

export default Login;
