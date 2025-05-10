
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
      console.log("No authenticated user or session");
      setConnectionError('Authentication required. Please login first.');
      return false;
    }

    // Check if session is about to expire and refresh it if needed
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    
    if (expiresAt < fiveMinutesFromNow) {
      console.log("Session is about to expire, refreshing...");
      const newSession = await refreshSession();
      if (!newSession) {
        console.error("Failed to refresh session");
        setConnectionError('Session refresh failed. Please login again.');
        return false;
      }
    }

    return true;
  }, [user, session, refreshSession]);

  // Function to get auth headers for all API calls
  const getAuthHeaders = useCallback(() => {
    // Always include the current auth token for each request
    if (!session || !session.access_token) {
      console.error("No valid auth token available");
      return {};
    }
    return {
      Authorization: `Bearer ${session.access_token}`
    };
  }, [session]);

  // Create a Plaid Link token
  const createLinkToken = async (products?: string[]): Promise<string | null> => {
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

  // Get user's connected accounts with retry mechanism
  const getAccounts = async (itemId?: string, retryCount = 0): Promise<PlaidAccount[]> => {
    if (!user) {
      console.log("No authenticated user found when attempting to get accounts");
      setConnectionError('Authentication required');
      return [];
    }

    setLoading(true);
    try {
      const isAuthenticated = await ensureAuthenticatedRequest();
      if (!isAuthenticated) return [];
      
      setConnectionError(null);
      console.log("Fetching plaid accounts...");
      const queryString = itemId ? `?item_id=${itemId}` : '';
      
      const { data, error } = await supabase.functions.invoke(
        `plaid-get-accounts${queryString}`,
        { headers: getAuthHeaders() }
      );

      if (error) {
        console.error("Error response from plaid-get-accounts function:", error);
        if (error.message && error.message.includes('Unauthorized') && retryCount < 2) {
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
        
        // If in development mode and no accounts, return mock data
        if (isDevelopmentMode()) {
          const mockAccounts = generateMockAccounts(user.id);
          setAccounts(mockAccounts);
          return mockAccounts;
        }
        
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
      
      // In dev mode, generate mock data on failure
      if (isDevelopmentMode()) {
        console.log("Development mode: Creating mock accounts due to API error");
        const mockAccounts = generateMockAccounts(user.id);
        setAccounts(mockAccounts);
        return mockAccounts;
      }
      
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
      const isAuthenticated = await ensureAuthenticatedRequest();
      if (!isAuthenticated) return false;
      
      setConnectionError(null);
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('plaid-sync-transactions', {
        body: { item_id: itemId },
        headers: getAuthHeaders()
      });

      if (error) {
        if (error.message && error.message.includes('Unauthorized') && retryCount < 2) {
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
      const isAuthenticated = await ensureAuthenticatedRequest();
      if (!isAuthenticated) {
        return { 
          transactions: [], 
          pagination: { total: 0, limit: 50, offset: 0, has_more: false } 
        };
      }
      
      setConnectionError(null);
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      
      if (params.accountId) queryParams.append('account_id', params.accountId);
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const { data, error } = await supabase.functions.invoke(
        `plaid-get-transactions${queryString}`,
        { headers: getAuthHeaders() }
      );

      if (error) {
        if (error.message && error.message.includes('Unauthorized') && retryCount < 2) {
          console.log(`Auth error, retrying (${retryCount + 1}/2)...`);
          await refreshSession();
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return getTransactions(params, retryCount + 1);
        }
        throw new Error(error.message);
      }
      
      // If in development mode and error or no data, return mock transactions
      if (isDevelopmentMode() && (!data || !data.transactions || data.transactions.length === 0)) {
        const mockData = generateMockTransactions(params.accountId);
        setTransactions(mockData.transactions);
        return mockData;
      }
      
      setTransactions(data.transactions || []);
      return {
        transactions: data.transactions || [],
        pagination: data.pagination || { total: 0, limit: 50, offset: 0, has_more: false },
      };
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      
      // In dev mode, generate mock data on failure
      if (isDevelopmentMode()) {
        const mockData = generateMockTransactions(params.accountId);
        setTransactions(mockData.transactions);
        return mockData;
      }
      
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
  
  // Generate mock accounts for development mode
  const generateMockAccounts = (userId: string): PlaidAccount[] => {
    return [
      {
        id: 'mock-account-1',
        item_id: 'mock-item-1',
        user_id: userId,
        plaid_account_id: 'mock-plaid-1',
        name: 'Mock Checking Account',
        mask: '1234',
        type: 'depository',
        subtype: 'checking',
        balance_available: 1250.45,
        balance_current: 1290.33,
        balance_limit: null,
        balance_iso_currency_code: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plaid_items: {
          institution_name: 'Mock Bank',
          status: 'active',
          error_message: null
        },
        official_name: 'Primary Checking Account'
      },
      {
        id: 'mock-account-2',
        item_id: 'mock-item-1',
        user_id: userId,
        plaid_account_id: 'mock-plaid-2',
        name: 'Mock Credit Card',
        mask: '5678',
        type: 'credit',
        subtype: 'credit card',
        balance_available: 3500.00,
        balance_current: 450.24,
        balance_limit: 5000.00,
        balance_iso_currency_code: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plaid_items: {
          institution_name: 'Mock Bank',
          status: 'active',
          error_message: null
        },
        official_name: 'Rewards Credit Card'
      }
    ];
  };
  
  // Generate mock transactions for development mode
  const generateMockTransactions = (accountId?: string): {
    transactions: PlaidTransaction[];
    pagination: { total: number; limit: number; offset: number; has_more: boolean };
  } => {
    const mockTransactions: PlaidTransaction[] = [];
    const now = new Date();
    
    // Generate 20 mock transactions
    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const accountIdToUse = accountId || (i % 2 === 0 ? 'mock-account-1' : 'mock-account-2');
      const isCredit = accountIdToUse === 'mock-account-2';
      
      mockTransactions.push({
        id: `mock-transaction-${i}`,
        account_id: accountIdToUse,
        user_id: user?.id || 'mock-user',
        plaid_transaction_id: `mock-plaid-tx-${i}`,
        name: i % 5 === 0 ? 'Coffee Shop' : 
              i % 4 === 0 ? 'Grocery Store' :
              i % 3 === 0 ? 'Online Shopping' :
              i % 2 === 0 ? 'Restaurant' : 'Gas Station',
        amount: isCredit ? 
                (Math.random() * 100 + 5).toFixed(2) as unknown as number : 
                (Math.random() * -100 - 5).toFixed(2) as unknown as number,
        date: date.toISOString().split('T')[0],
        pending: i < 3,
        category: i % 5 === 0 ? ['Food and Drink', 'Coffee'] : 
                i % 4 === 0 ? ['Shops', 'Groceries'] :
                i % 3 === 0 ? ['Shops', 'Online'] :
                i % 2 === 0 ? ['Food and Drink', 'Restaurants'] : ['Transportation', 'Gas'],
        merchant_name: i % 5 === 0 ? 'Starbucks' : 
                      i % 4 === 0 ? 'Whole Foods' :
                      i % 3 === 0 ? 'Amazon' :
                      i % 2 === 0 ? 'Chipotle' : 'Shell',
        payment_channel: i % 2 === 0 ? 'in store' : 'online',
        location: {
          address: '123 Main St',
          city: 'Anytown',
          region: 'CA',
          postal_code: '12345',
          country: 'US',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plaid_accounts: {
          name: i % 2 === 0 ? 'Mock Checking Account' : 'Mock Credit Card',
          mask: i % 2 === 0 ? '1234' : '5678',
          type: i % 2 === 0 ? 'depository' : 'credit',
          subtype: i % 2 === 0 ? 'checking' : 'credit card'
        }
      });
    }
    
    return {
      transactions: mockTransactions,
      pagination: {
        total: 100,
        limit: 20,
        offset: 0,
        has_more: true
      }
    };
  };

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
