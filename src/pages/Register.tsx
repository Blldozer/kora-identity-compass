
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  
  const handleRegister = async () => {
    try {
      // For demo purposes
      await signUp('new@example.com', 'password123');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };
  
  if (user) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        <p className="text-center text-muted-foreground mb-6">
          Join Kora to take control of your financial health.
        </p>
        <button 
          onClick={handleRegister} 
          className="w-full bg-primary text-white p-3 rounded-md hover:bg-primary/90"
        >
          Sign Up (Demo)
        </button>
      </div>
    </div>
  );
};

export default Register;
