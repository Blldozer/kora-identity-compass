
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';

export type PlaidItem = {
  id: string;
  user_id: string;
  plaid_item_id: string;
  plaid_institution_id: string | null;
  institution_name: string | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type PlaidAccount = {
  id: string;
  item_id: string;
  user_id: string;
  plaid_account_id: string;
  name: string;
  mask: string | null;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balance_available: number | null;
  balance_current: number | null;
  balance_limit: number | null;
  balance_iso_currency_code: string | null;
  created_at: string;
  updated_at: string;
  plaid_items?: {
    institution_name: string | null;
    status: string;
    error_message: string | null;
  };
};

export type PlaidTransaction = {
  id: string;
  account_id: string;
  user_id: string;
  plaid_transaction_id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category: string[] | null;
  merchant_name: string | null;
  payment_channel: string | null;
  location: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  plaid_accounts?: {
    name: string;
    mask: string | null;
    type: string;
    subtype: string | null;
  };
};

export const usePlaid = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, session, refreshSession } = useAuth();

  // Create a method to ensure we have a valid session before making requests
  const ensureAuthenticatedRequest = useCallback(async () => {
    if (!user || !session) {
      console.error("No authenticated user or session");
      throw new Error('Authentication required');
    }

    // Check if session is about to expire and refresh it if needed
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    
    if (expiresAt < fiveMinutesFromNow) {
      console.log("Session is about to expire, refreshing...");
      const newSession = await refreshSession();
      if (!newSession) {
        console.error("Failed to refresh session");
        throw new Error('Session refresh failed');
      }
    }

    return true;
  }, [user, session, refreshSession]);

  // Create a Plaid Link token
  const createLinkToken = async (products?: string[]): Promise<string | null> => {
    try {
      await ensureAuthenticatedRequest();
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { products },
      });

      if (error) throw new Error(error.message);
      
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
    try {
      await ensureAuthenticatedRequest();
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-exchange-public-token', {
        body: { public_token: publicToken, institution },
      });

      if (error) throw new Error(error.message);
      
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

  // Get user's connected accounts with retry mechanism
  const getAccounts = async (itemId?: string, retryCount = 0): Promise<PlaidAccount[]> => {
    if (!user) {
      console.log("No authenticated user found when attempting to get accounts");
      setConnectionError('Authentication required');
      return [];
    }

    setLoading(true);
    try {
      await ensureAuthenticatedRequest();
      setConnectionError(null);
      console.log("Fetching plaid accounts...");
      const queryString = itemId ? `?item_id=${itemId}` : '';
      
      const { data, error } = await supabase.functions.invoke(`plaid-get-accounts${queryString}`);

      if (error) {
        console.error("Error response from plaid-get-accounts function:", error);
        if (error.message.includes('Unauthorized') && retryCount < 2) {
          console.log(`Auth error, retrying (${retryCount + 1}/2)...`);
          await refreshSession();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return getAccounts(itemId, retryCount + 1);
        }
        throw new Error(error.message || "Failed to fetch accounts");
      }
      
      if (!data || !data.accounts) {
        console.warn("No accounts data returned from plaid-get-accounts function");
        setAccounts([]);
        return [];
      }
      
      console.log(`Successfully fetched ${data.accounts.length} accounts`);
      
      if (data.is_mock_data) {
        console.log("Using mock account data for development");
        toast({
          title: 'Development Mode',
          description: 'Using mock account data since this is a development environment.',
        });
      }
      
      setAccounts(data.accounts);
      return data.accounts;
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      setConnectionError('Failed to load financial accounts');
      
      // Toast the error but don't show it to the user if they haven't specifically requested accounts
      // This prevents error toast spam on load
      if (itemId) {
        toast({
          title: 'Error',
          description: 'Failed to load your financial accounts.',
          variant: 'destructive',
        });
      }
      
      // Return empty array rather than throwing to prevent component crashes
      setAccounts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Sync transactions for an item
  const syncTransactions = async (itemId: string, retryCount = 0): Promise<boolean> => {
    try {
      await ensureAuthenticatedRequest();
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-sync-transactions', {
        body: { item_id: itemId },
      });

      if (error) {
        if (error.message.includes('Unauthorized') && retryCount < 2) {
          console.log(`Auth error, retrying (${retryCount + 1}/2)...`);
          await refreshSession();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return syncTransactions(itemId, retryCount + 1);
        }
        throw new Error(error.message);
      }
      
      toast({
        title: 'Transactions Synced',
        description: `Successfully synced ${data.transactions_added} transactions.`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error syncing transactions:', error);
      setConnectionError('Failed to sync transactions');
      toast({
        title: 'Sync Error',
        description: 'Failed to sync your transactions. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get transactions for a user
  const getTransactions = async (params: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  } = {}, retryCount = 0): Promise<{
    transactions: PlaidTransaction[];
    pagination: { total: number; limit: number; offset: number; has_more: boolean };
  }> => {
    try {
      await ensureAuthenticatedRequest();
      setConnectionError(null);
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      
      if (params.accountId) queryParams.append('account_id', params.accountId);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const { data, error } = await supabase.functions.invoke(`plaid-get-transactions${queryString}`);

      if (error) {
        if (error.message.includes('Unauthorized') && retryCount < 2) {
          console.log(`Auth error, retrying (${retryCount + 1}/2)...`);
          await refreshSession();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return getTransactions(params, retryCount + 1);
        }
        throw new Error(error.message);
      }
      
      setTransactions(data.transactions || []);
      return {
        transactions: data.transactions || [],
        pagination: data.pagination || { total: 0, limit: 50, offset: 0, has_more: false },
      };
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setConnectionError('Failed to load transactions');
      toast({
        title: 'Error',
        description: 'Failed to load your transactions.',
        variant: 'destructive',
      });
      return { transactions: [], pagination: { total: 0, limit: 50, offset: 0, has_more: false } };
    } finally {
      setLoading(false);
    }
  };

  // Delete a Plaid item
  const deleteItem = async (itemId: string, retryCount = 0): Promise<boolean> => {
    try {
      await ensureAuthenticatedRequest();
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-delete-item', {
        body: { item_id: itemId },
      });

      if (error) {
        if (error.message.includes('Unauthorized') && retryCount < 2) {
          console.log(`Auth error, retrying (${retryCount + 1}/2)...`);
          await refreshSession();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return deleteItem(itemId, retryCount + 1);
        }
        throw new Error(error.message);
      }
      
      toast({
        title: 'Account Removed',
        description: 'Financial account connection was successfully removed.',
      });
      
      // Update the accounts list after deletion
      await getAccounts();
      
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

  // Check if we're in development/sandbox mode
  const isDevelopmentMode = useCallback(() => {
    // We can't directly check the environment here in the client,
    // but we can determine this based on the response from the server
    // or by checking for a development URL
    const isDev = window.location.hostname === 'localhost' || 
                 window.location.hostname.includes('127.0.0.1') ||
                 window.location.hostname.includes('.lovable.dev');
    return isDev;
  }, []);

  return {
    loading,
    accounts,
    transactions,
    connectionError,
    isDevelopmentMode,
    createLinkToken,
    exchangePublicToken,
    getAccounts,
    syncTransactions,
    getTransactions,
    deleteItem,
  };
};
