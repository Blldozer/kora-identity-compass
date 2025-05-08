
import React from 'react';
import { PlaidLink } from './PlaidLink';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface PlaidButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const PlaidButton: React.FC<PlaidButtonProps> = ({
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlaidClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to log in to connect your bank accounts.",
        variant: "default",
      });
      navigate('/login');
      return;
    }
    
    // If user is logged in, they'll be directed to the finances page
    navigate('/finances');
  };

  return user ? (
    <PlaidLink 
      buttonText="Connect Bank Account"
      className={className}
      variant={variant}
      size={size}
      products={['auth', 'transactions', 'identity']}
      onSuccess={() => navigate('/finances')}
    />
  ) : (
    <Button 
      className={className}
      variant={variant}
      size={size}
      onClick={handlePlaidClick}
    >
      Connect Bank Account
    </Button>
  );
};
