
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import StatsCarousel from '@/components/landing/StatsCarousel';
import { PlaidButton } from '@/components/plaid/PlaidButton';
import { CreditCard, Receipt, BarChart3, Target, MessageSquareText, Shield } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureHighlight, FeatureGrid } from '@/components/landing/FeatureHighlight';
import { WelcomeCta } from '@/components/landing/WelcomeCta';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Section */}
      <div className="py-10 kora-background-gradient">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Track Your Financial Health</h2>
          <StatsCarousel />
          
          {user && (
            <div className="mt-8 flex justify-center gap-4">
              <PlaidButton 
                className="h-12 text-base"
                variant="outline"
              />
              <Button 
                variant="outline" 
                className="h-12 text-base"
                onClick={() => navigate('/receipts')}
              >
                <Receipt className="h-5 w-5 mr-2" />
                Capture Receipts
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">How Kora Works</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">
          Kora is designed to be with you at every financial moment, providing context and insights when you need them.
        </p>
        
        <FeatureGrid>
          <FeatureHighlight 
            icon={Receipt}
            title="Smart Receipt Scanning"
            description="Capture and analyze receipts instantly for detailed spending insights"
          />
          <FeatureHighlight 
            icon={BarChart3}
            title="Visual Finance Tracking"
            description="See where your money goes with intuitive charts and breakdowns"
          />
          <FeatureHighlight 
            icon={CreditCard}
            title="Complete Account Integration"
            description="Connect all your accounts for a unified financial picture"
          />
          <FeatureHighlight 
            icon={Target}
            title="Goal Setting & Tracking"
            description="Set financial goals with visual progress tracking"
          />
          <FeatureHighlight 
            icon={MessageSquareText}
            title="AI Financial Assistant"
            description="Get personalized advice and answers to financial questions"
          />
          <FeatureHighlight 
            icon={Shield}
            title="Privacy-First Design"
            description="Your sensitive financial data never leaves your device"
          />
        </FeatureGrid>
      </div>
      
      {/* Call to Action */}
      <div className="kora-background-gradient-strong py-10">
        <div className="max-w-4xl mx-auto">
          <WelcomeCta />
        </div>
      </div>
    </div>
  );
};

export default Index;
