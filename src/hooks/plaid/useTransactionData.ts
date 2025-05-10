
import { useState, useCallback } from 'react';
import { useAuthentication } from './useAuthentication';
import { useAccountsData } from './useAccountsData';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { PlaidTransaction } from './types';
import { isDevelopmentMode, generateMockTransactions, canMakeApiCall } from './plaidUtils';

export const useTransactionData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { ensureAuthenticatedRequest, getAuthHeaders, refreshSession, user } = useAuthentication();
  const { getAccounts } = useAccountsData();

  // Sync transactions for an item
  const syncTransactions = async (itemId: string, retryCount = 0): Promise<boolean> => {
    // Check rate limiting
    if (!canMakeApiCall(`sync_transactions_${itemId}`, 30000)) { // 30 second cooldown
      console.log("Rate limited: syncTransactions called too frequently");
      toast({
        title: 'Please wait',
        description: 'You can sync transactions every 30 seconds.',
      });
      return false;
    }

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
          // Wait with exponential backoff before retrying
          await new Promise(resolve => setTimeout(resolve, (2 ** retryCount) * 1000));
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
    // Rate limiting based on the combination of parameters
    const cacheKey = `get_transactions_${params.accountId || 'all'}_${params.startDate || ''}_${params.endDate || ''}_${params.offset || 0}`;
    if (!canMakeApiCall(cacheKey, 5000)) {
      console.log("Rate limited: getTransactions called too frequently");
      return { 
        transactions, 
        pagination: { total: 0, limit: 50, offset: 0, has_more: false } 
      };
    }

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
          // Wait with exponential backoff before retrying
          await new Promise(resolve => setTimeout(resolve, (2 ** retryCount) * 1000));
          return getTransactions(params, retryCount + 1);
        }
        throw new Error(error.message);
      }
      
      // If in development mode and error or no data, return mock transactions
      if (isDevelopmentMode() && (!data || !data.transactions || data.transactions.length === 0)) {
        const mockData = generateMockTransactions(user?.id || 'mock-user', params.accountId);
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
        const mockData = generateMockTransactions(user?.id || 'mock-user', params.accountId);
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

  return {
    transactions,
    loading,
    connectionError,
    syncTransactions,
    getTransactions,
    setConnectionError,
  };
};
