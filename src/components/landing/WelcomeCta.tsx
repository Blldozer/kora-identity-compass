
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function WelcomeCta() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="py-8 px-4 sm:px-6 flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 tracking-tight">
        Ready to take control of your financial future?
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-lg">
        Kora provides the tools and insights you need to understand your spending, 
        save more effectively, and build lasting financial health.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {user ? (
          <>
            <Button 
              className="h-12 px-8 text-lg font-medium shadow-lg shadow-kora-orange/20"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="h-12 px-8 text-lg font-medium border-2"
              onClick={() => navigate('/finances')}
            >
              View Finances
            </Button>
          </>
        ) : (
          <>
            <Button 
              className="h-12 px-8 text-lg font-medium shadow-lg shadow-kora-orange/20"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              className="h-12 px-8 text-lg font-medium border-2"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
