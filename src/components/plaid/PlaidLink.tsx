
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';

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
    if (window.Plaid) {
      console.log("Plaid Link already loaded");
      resolve();
      return;
    }
    
    console.log("Loading Plaid Link script");
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => {
      console.log("Plaid Link script loaded successfully");
      resolve();
    };
    script.onerror = (error) => {
      console.error("Failed to load Plaid Link script:", error);
      reject(new Error('Failed to load Plaid Link script'));
    };
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
  const [scriptError, setScriptError] = useState<string | null>(null);
  const { createLinkToken, exchangePublicToken, connectionError, isDevelopmentMode } = usePlaid();

  const isDevMode = isDevelopmentMode();

  const loadScript = useCallback(async () => {
    try {
      setScriptError(null);
      await loadPlaidLinkScript();
      setPlaidLoaded(true);
    } catch (error) {
      console.error('Error loading Plaid script:', error);
      setScriptError('Failed to load Plaid connection script');
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
      console.log("Requesting link token...");
      const token = await createLinkToken(products);
      if (!token) {
        throw new Error('Failed to create link token');
      }
      
      console.log("Link token received, initializing Plaid Link");
      setLinkToken(token);

      if (plaidLoaded && token) {
        const plaidLinkHandler = window.Plaid.create({
          token,
          onSuccess: async (public_token, metadata) => {
            console.log('Plaid Link success, exchanging token...', metadata.institution.name);
            const success = await exchangePublicToken(public_token, metadata.institution);
            if (success && onSuccess) {
              onSuccess();
            }
          },
          onExit: (err, metadata) => {
            console.log('Plaid Link exit', err, metadata);
            setIsLoading(false);
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
            // Track specific events for better debugging
            if (eventName === 'ERROR') {
              console.error('Plaid Link error event:', metadata);
            }
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

  // If connectionError or scriptError, show an inline alert with error information
  const hasError = connectionError || scriptError;

  return (
    <>
      {hasError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {connectionError || scriptError}
            {isDevMode && (
              <div className="mt-2 text-sm">
                <p>Sandbox mode is active. Make sure your Plaid credentials are correctly set up in Supabase.</p>
                <p className="mt-1">In sandbox mode, you can use test credentials like:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Username: <code>user_good</code></li>
                  <li>Password: <code>pass_good</code></li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
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
              {isDevMode && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <p className="font-medium">Development Mode Detected</p>
                  <p className="mt-1">You'll be able to use test credentials to connect sandbox accounts.</p>
                  <p className="mt-2">Example credentials:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Username: <code>user_good</code></li>
                    <li>Password: <code>pass_good</code></li>
                  </ul>
                </div>
              )}
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
