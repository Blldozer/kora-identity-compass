
import { useState } from 'react';
import { useAuthentication } from './useAuthentication';
import { useLinkManagement } from './useLinkManagement';
import { useAccountsData } from './useAccountsData';
import { useTransactionData } from './useTransactionData';
import { isDevelopmentMode as checkDevMode } from './plaidUtils';
import { PlaidAccount, PlaidTransaction, PlaidItem } from './types';

// Main hook to manage Plaid interaction, acting as a facade for the modularized hooks
export const usePlaid = () => {
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Authentication hooks
  const auth = useAuthentication();
  
  // Link management hooks
  const linkManagement = useLinkManagement();
  
  // Account data hooks
  const accountsData = useAccountsData();
  
  // Transaction data hooks
  const transactionData = useTransactionData();
  
  // Combine loading states
  const loading = linkManagement.loading || accountsData.loading || transactionData.loading;
  
  // Combine error states
  const combinedError = connectionError || 
                       linkManagement.connectionError || 
                       accountsData.connectionError || 
                       transactionData.connectionError;
                       
  if (combinedError && !connectionError) {
    setConnectionError(combinedError);
  }

  // Reexport types for convenience
  return {
    // Loading and error states
    loading,
    connectionError,
    
    // Auth-related
    user: auth.user,
    session: auth.session,
    
    // Link-related
    createLinkToken: linkManagement.createLinkToken,
    exchangePublicToken: linkManagement.exchangePublicToken,
    deleteItem: linkManagement.deleteItem,
    
    // Account-related
    accounts: accountsData.accounts,
    getAccounts: accountsData.getAccounts,
    
    // Transaction-related
    transactions: transactionData.transactions,
    syncTransactions: transactionData.syncTransactions,
    getTransactions: transactionData.getTransactions,
    
    // Utility
    isDevelopmentMode: checkDevMode,
    
    // Error handling
    setConnectionError,
  };
};

// Re-export types for convenience
export type { PlaidAccount, PlaidTransaction, PlaidItem };
