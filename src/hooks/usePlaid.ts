
import { useState } from 'react';
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
  const { user, session } = useAuth();

  // Create a Plaid Link token
  const createLinkToken = async (products?: string[]): Promise<string | null> => {
    if (!user || !session) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to connect a bank account.',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: { products },
      });

      if (error) throw new Error(error.message);
      
      return data.link_token;
    } catch (error) {
      console.error('Error creating link token:', error);
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
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to connect a bank account.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plaid-exchange-public-token', {
        body: { public_token: publicToken, institution },
      });

      if (error) throw new Error(error.message);
      
      toast({
        title: 'Account Connected',
        description: 'Your financial account was successfully connected.',
      });
      
      return true;
    } catch (error) {
      console.error('Error exchanging token:', error);
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

  // Get user's connected accounts
  const getAccounts = async (itemId?: string): Promise<PlaidAccount[]> => {
    if (!user) {
      console.log("No authenticated user found when attempting to get accounts");
      return [];
    }

    setLoading(true);
    try {
      console.log("Fetching plaid accounts...");
      const queryString = itemId ? `?item_id=${itemId}` : '';
      
      const { data, error } = await supabase.functions.invoke(`plaid-get-accounts${queryString}`);

      if (error) {
        console.error("Error response from plaid-get-accounts function:", error);
        throw new Error(error.message || "Failed to fetch accounts");
      }
      
      if (!data || !data.accounts) {
        console.warn("No accounts data returned from plaid-get-accounts function");
        setAccounts([]);
        return [];
      }
      
      console.log(`Successfully fetched ${data.accounts.length} accounts`);
      setAccounts(data.accounts);
      return data.accounts;
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
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
  const syncTransactions = async (itemId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to sync transactions.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plaid-sync-transactions', {
        body: { item_id: itemId },
      });

      if (error) throw new Error(error.message);
      
      toast({
        title: 'Transactions Synced',
        description: `Successfully synced ${data.transactions_added} transactions.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error syncing transactions:', error);
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
  } = {}): Promise<{
    transactions: PlaidTransaction[];
    pagination: { total: number; limit: number; offset: number; has_more: boolean };
  }> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to view transactions.',
        variant: 'destructive',
      });
      return { transactions: [], pagination: { total: 0, limit: 50, offset: 0, has_more: false } };
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (params.accountId) queryParams.append('account_id', params.accountId);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const { data, error } = await supabase.functions.invoke(`plaid-get-transactions${queryString}`);

      if (error) throw new Error(error.message);
      
      setTransactions(data.transactions || []);
      return {
        transactions: data.transactions || [],
        pagination: data.pagination || { total: 0, limit: 50, offset: 0, has_more: false },
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
  const deleteItem = async (itemId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to remove a bank connection.',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plaid-delete-item', {
        body: { item_id: itemId },
      });

      if (error) throw new Error(error.message);
      
      toast({
        title: 'Account Removed',
        description: 'Financial account connection was successfully removed.',
      });
      
      // Update the accounts list after deletion
      await getAccounts();
      
      return true;
    } catch (error) {
      console.error('Error removing account:', error);
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
    accounts,
    transactions,
    createLinkToken,
    exchangePublicToken,
    getAccounts,
    syncTransactions,
    getTransactions,
    deleteItem,
  };
};
