
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface RegisterLinkProps {
  disabled?: boolean;
}

export const RegisterLink = ({ disabled }: RegisterLinkProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center mt-6">
      <p className="text-base">
        Don't have an account? 
        <Button 
          variant="link" 
          onClick={() => navigate('/register')}
          className="text-base"
          disabled={disabled}
        >
          Register
        </Button>
      </p>
    </div>
  );
};
