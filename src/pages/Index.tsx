
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import StatsCarousel from '@/components/landing/StatsCarousel';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-md mx-auto px-4 py-12">
        <StatsCarousel />
        
        <div className="space-y-4">
          {user ? (
            <Button 
              className="w-full h-12 text-lg bg-[#0A2463] hover:bg-[#0A2463]/90"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button 
                className="w-full h-12 text-lg bg-[#0A2463] hover:bg-[#0A2463]/90"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 text-lg border-[#0A2463] text-[#0A2463]"
                onClick={() => navigate('/register')}
              >
                Create an account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
