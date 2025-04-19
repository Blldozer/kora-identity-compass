
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
          Kora Financial Health Platform
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Take control of your financial future with AI-powered insights, transaction tracking, and personalized recommendations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button 
              className="text-lg py-6 px-8"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                className="text-lg py-6 px-8"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
              <Button 
                variant="outline" 
                className="text-lg py-6 px-8"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-20 text-center px-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">AI Financial Companion</h3>
            <p className="text-slate-600">Get personalized financial advice and insights powered by advanced AI.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Complete Transaction Tracking</h3>
            <p className="text-slate-600">Track all your expenses across multiple accounts in one place.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Privacy-First Design</h3>
            <p className="text-slate-600">Your sensitive financial data is processed securely with privacy as a priority.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
