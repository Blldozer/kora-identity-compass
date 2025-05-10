
import React from 'react';
import { KoraWaveBackground } from '@/components/ui/kora-wave-background';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="relative px-4 py-20 overflow-hidden">
      <KoraWaveBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-kora-orange via-kora-orange-light to-kora-blue bg-clip-text text-transparent">
          Your AI Financial Advisor Always In Your Corner
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Kora helps you understand your spending habits, track receipts, and make 
          smarter financial decisions in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button 
              className="h-14 px-10 text-lg font-medium shadow-lg shadow-kora-orange/20"
              onClick={() => navigate('/dashboard')}
            >
              View Your Dashboard
            </Button>
          ) : (
            <Button 
              className="h-14 px-10 text-lg font-medium shadow-lg shadow-kora-orange/20"
              onClick={() => navigate('/register')}
            >
              Start Your Journey
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
