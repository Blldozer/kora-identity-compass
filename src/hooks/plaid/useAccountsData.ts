
import { useState, useCallback } from 'react';
import { useAuthentication } from './useAuthentication';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { PlaidAccount } from './types';
import { generateMockAccounts, isDevelopmentMode, canMakeApiCall, showErrorToast } from './plaidUtils';

export const useAccountsData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, ensureAuthenticatedRequest, getAuthHeaders, refreshSession } = useAuthentication();
  
  // Cache for storing account data with expiration
  const accountsCache = useCallback(() => {
    const cacheKey = 'plaid_accounts_cache';
    
    return {
      get: () => {
        const cachedData = localStorage.getItem(cacheKey);
        if (!cachedData) return null;
        
        const { accounts, timestamp, userId } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 minute expiration
        const isSameUser = userId === user?.id;
        
        if (isExpired || !isSameUser) {
          localStorage.removeItem(cacheKey);
          return null;
        }
        
        return accounts;
      },
      set: (accountsData: PlaidAccount[]) => {
        localStorage.setItem(cacheKey, JSON.stringify({
          accounts: accountsData,
          timestamp: Date.now(),
          userId: user?.id
        }));
      },
      clear: () => {
        localStorage.removeItem(cacheKey);
      }
    };
  }, [user?.id]);

  // Get user's connected accounts with retry mechanism
  const getAccounts = async (itemId?: string, retryCount = 0, options = { 
    bypassCache: false,
    showErrors: true
  }): Promise<PlaidAccount[]> => {
    if (!user) {
      console.log("No authenticated user found when attempting to get accounts");
      setConnectionError('Authentication required');
      return [];
    }

    // Check rate limiting - allow one call per 5 seconds (adjustable)
    const rateLimit = itemId ? 5000 : 10000; // 5s for specific item, 10s for all accounts
    if (!canMakeApiCall(`get_accounts${itemId ? `_${itemId}` : ''}`, rateLimit)) {
      console.log("Rate limited: getAccounts called too frequently");
      
      // If we have cached accounts, return them
      const cachedAccounts = !options.bypassCache && accountsCache().get();
      if (cachedAccounts) {
        console.log("Returning cached accounts data");
        setAccounts(cachedAccounts);
        return cachedAccounts;
      }
      
      // If in dev mode and no cache, return mock accounts
      if (isDevelopmentMode()) {
        console.log("Development mode: Creating mock accounts due to rate limiting");
        const mockAccounts = generateMockAccounts(user.id);
        setAccounts(mockAccounts);
        return mockAccounts;
      }
      
      return accounts; // Return current state if rate limited
    }

    // Try to use cached data first if not bypassing cache
    if (!options.bypassCache) {
      const cachedAccounts = accountsCache().get();
      if (cachedAccounts) {
        console.log("Using cached accounts data");
        setAccounts(cachedAccounts);
        // Still fetch in background to update cache
        setTimeout(() => {
          getAccounts(itemId, 0, { bypassCache: true, showErrors: false });
        }, 100);
        return cachedAccounts;
      }
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
          // Wait with exponential backoff before retrying
          await new Promise(resolve => setTimeout(resolve, (2 ** retryCount) * 1000));
          return getAccounts(itemId, retryCount + 1, options);
        }
        throw new Error(error.message || "Failed to fetch accounts");
      }
      
      if (!data || !data.accounts) {
        console.warn("No accounts data returned from plaid-get-accounts function");
        
        // If in development mode and no accounts, return mock data
        if (isDevelopmentMode()) {
          const mockAccounts = generateMockAccounts(user.id);
          setAccounts(mockAccounts);
          accountsCache().set(mockAccounts);
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
      accountsCache().set(data.accounts);
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
      
      // Only show error toast if specified
      if (options.showErrors) {
        showErrorToast('Error', 'Failed to load your financial accounts.', {
          onlyIfRequested: !itemId // Don't spam with errors unless specifically requested
        });
      }
      
      // Return empty array rather than throwing to prevent component crashes
      setAccounts([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    loading,
    connectionError,
    setConnectionError,
    getAccounts,
  };
};
