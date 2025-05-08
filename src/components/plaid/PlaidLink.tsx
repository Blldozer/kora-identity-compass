
import React, { useCallback, useState, useEffect } from 'react';
import { usePlaid } from '@/hooks/usePlaid';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

// Type declarations for Plaid Link
declare global {
  interface Window {
    Plaid: {
      create: (config: {
        token: string;
        onSuccess: (public_token: string, metadata: any) => void;
        onExit: (err: any, metadata: any) => void;
        onEvent: (event: string, metadata: any) => void;
        onLoad: () => void;
        receivedRedirectUri?: string;
      }) => {
        open: () => void;
        exit: () => void;
      };
    };
  }
}

// Load Plaid Link script
const loadPlaidLinkScript = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Plaid Link script'));
    document.body.appendChild(script);
  });
};

interface PlaidLinkProps {
  onSuccess?: () => void;
  buttonText?: string;
  products?: string[];
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const PlaidLink: React.FC<PlaidLinkProps> = ({
  onSuccess,
  buttonText = 'Connect Bank Account',
  products = ['auth', 'transactions', 'identity'],
  className = '',
  variant = 'default',
  size = 'default',
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [plaidLoaded, setPlaidLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createLinkToken, exchangePublicToken } = usePlaid();

  const loadScript = useCallback(async () => {
    try {
      await loadPlaidLinkScript();
      setPlaidLoaded(true);
    } catch (error) {
      console.error('Error loading Plaid script:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Plaid connection. Please try again later.',
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  const openPlaidLink = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await createLinkToken(products);
      if (!token) {
        throw new Error('Failed to create link token');
      }
      
      setLinkToken(token);

      if (plaidLoaded && token) {
        const plaidLinkHandler = window.Plaid.create({
          token,
          onSuccess: async (public_token, metadata) => {
            console.log('Plaid Link success', metadata);
            const success = await exchangePublicToken(public_token, metadata.institution);
            if (success && onSuccess) {
              onSuccess();
            }
          },
          onExit: (err, metadata) => {
            console.log('Plaid Link exit', err, metadata);
            if (err) {
              toast({
                title: 'Connection Interrupted',
                description: 'The bank connection process was interrupted. Please try again.',
                variant: 'destructive',
              });
            }
          },
          onEvent: (eventName, metadata) => {
            console.log('Plaid Link event', eventName, metadata);
          },
          onLoad: () => {
            console.log('Plaid Link loaded');
            setIsLoading(false);
          },
        });
        
        plaidLinkHandler.open();
      }
    } catch (error) {
      console.error('Error opening Plaid Link:', error);
      setIsLoading(false);
      toast({
        title: 'Connection Error',
        description: 'Failed to initialize bank connection. Please try again.',
        variant: 'destructive',
      });
    }
  }, [plaidLoaded, createLinkToken, exchangePublicToken, products, onSuccess]);

  const handleConnect = () => {
    if (!plaidLoaded) {
      setIsModalOpen(true);
      loadScript();
    } else {
      openPlaidLink();
    }
  };

  // If the modal is open and Plaid is loaded, open Plaid Link
  useEffect(() => {
    if (isModalOpen && plaidLoaded) {
      openPlaidLink();
      setIsModalOpen(false);
    }
  }, [isModalOpen, plaidLoaded, openPlaidLink]);

  return (
    <>
      <Button
        onClick={handleConnect}
        className={className}
        variant={variant}
        size={size}
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : buttonText}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Plaid Connection</DialogTitle>
            <DialogDescription>
              We're preparing to connect to your financial institution. This will only take a moment...
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
