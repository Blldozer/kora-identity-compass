
import { useState, useCallback } from 'react';
import { useAuthentication } from './useAuthentication';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { canMakeApiCall } from './plaidUtils';

export const useLinkManagement = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { ensureAuthenticatedRequest, getAuthHeaders } = useAuthentication();

  // Create a Plaid Link token
  const createLinkToken = async (products?: string[]): Promise<string | null> => {
    // Check if we can make this API call (rate limit)
    if (!canMakeApiCall('create_link_token', 5000)) {
      console.log("Rate limited: Create link token called too frequently");
      return null;
    }

    try {
      const isAuthenticated = await ensureAuthenticatedRequest();
      if (!isAuthenticated) return null;
      
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { products },
        headers: getAuthHeaders()
      });

      if (error) throw error;
      
      return data.link_token;
    } catch (error: any) {
      console.error('Error creating link token:', error);
      setConnectionError('Failed to initialize Plaid connection');
      toast({
        title: 'Connection Error',
        description: 'Failed to initialize connection to financial institution.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Exchange a public token for an access token
  const exchangePublicToken = async (publicToken: string, institution?: any): Promise<boolean> => {
    // Check if we can make this API call (rate limit)
    if (!canMakeApiCall('exchange_public_token', 10000)) {
      console.log("Rate limited: Exchange public token called too frequently");
      toast({
        title: 'Please wait',
        description: 'Processing your previous request. Please try again in a moment.',
      });
      return false;
    }

    try {
      const isAuthenticated = await ensureAuthenticatedRequest();
      if (!isAuthenticated) return false;
      
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-exchange-public-token', {
        body: { public_token: publicToken, institution },
        headers: getAuthHeaders()
      });

      if (error) throw error;
      
      toast({
        title: 'Account Connected',
        description: 'Your financial account was successfully connected.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error exchanging token:', error);
      setConnectionError('Failed to connect financial account');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect your financial account. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a Plaid item
  const deleteItem = async (itemId: string, retryCount = 0): Promise<boolean> => {
    // Check if we can make this API call (rate limit)
    if (!canMakeApiCall(`delete_item_${itemId}`, 10000)) {
      console.log("Rate limited: Delete item called too frequently");
      return false;
    }

    try {
      const isAuthenticated = await ensureAuthenticatedRequest();
      if (!isAuthenticated) return false;
      
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-delete-item', {
        body: { item_id: itemId },
        headers: getAuthHeaders()
      });

      if (error) {
        if (error.message && error.message.includes('Unauthorized') && retryCount < 2) {
          console.log(`Auth error, retrying (${retryCount + 1}/2)...`);
          // Wait with exponential backoff before retrying
          await new Promise(resolve => setTimeout(resolve, (2 ** retryCount) * 1000));
          return deleteItem(itemId, retryCount + 1);
        }
        throw new Error(error.message);
      }
      
      toast({
        title: 'Account Removed',
        description: 'Financial account connection was successfully removed.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error removing account:', error);
      setConnectionError('Failed to remove account connection');
      toast({
        title: 'Error',
        description: 'Failed to remove financial account connection.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    connectionError,
    createLinkToken,
    exchangePublicToken,
    deleteItem,
    setConnectionError
  };
};
