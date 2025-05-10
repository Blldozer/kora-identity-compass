
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { PlaidAccount, PlaidTransaction } from './types';

// Utility to determine if we're in development mode
export const isDevelopmentMode = (): boolean => {
  // We can't directly check the environment here in the client,
  // but we can determine this based on the response from the server
  // or by checking for a development URL
  const isDev = window.location.hostname === 'localhost' || 
               window.location.hostname.includes('127.0.0.1') ||
               window.location.hostname.includes('.lovable.dev');
  return isDev;
};

// Cache for storing API call timestamps and results
const apiCallCache: Record<string, {timestamp: number, data: any}> = {};

// Rate limiter to prevent excessive API calls
export const canMakeApiCall = (operationKey: string, cooldownMs = 5000): boolean => {
  const now = Date.now();
  const lastCallTime = localStorage.getItem(`plaid_${operationKey}_last_call`);
  
  if (lastCallTime && now - parseInt(lastCallTime) < cooldownMs) {
    return false;
  }
  
  localStorage.setItem(`plaid_${operationKey}_last_call`, now.toString());
  return true;
};

// Generate mock accounts for development mode
export const generateMockAccounts = (userId: string): PlaidAccount[] => {
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
export const generateMockTransactions = (userId: string, accountId?: string): {
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
      user_id: userId,
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

// Helper to show error toast without spamming the user
export const showErrorToast = (title: string, description: string, options?: { onlyIfRequested?: boolean }) => {
  // Only show error toast if explicitly requested or no option is provided
  if (!options?.onlyIfRequested) {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  }
};
