
// Account operations for the plaid-get-accounts function
import { corsHeaders } from "./cors.ts";

// Get accounts from the database
export async function getAccounts(supabaseClient, userId, itemId = null) {
  console.log("Building query to get accounts");

  let query = supabaseClient
    .from('plaid_accounts')
    .select(`
      *,
      plaid_items (
        institution_name,
        status,
        error_message
      )
    `)
    .eq('user_id', userId);
  
  // If item_id is provided, filter by it
  if (itemId) {
    console.log(`Filtering by item_id: ${itemId}`);
    query = query.eq('item_id', itemId);
  }
  
  // Execute query
  console.log("Executing query to get accounts");
  const { data: accounts, error: accountsError } = await query;

  if (accountsError) {
    console.error("Error retrieving accounts:", accountsError);
    throw {
      status: 500,
      message: 'Failed to retrieve accounts',
      details: accountsError.message || 'Database error when retrieving accounts'
    };
  }

  return accounts || [];
}

// Generate mock accounts for development environment
export function generateMockAccounts(userId) {
  console.log("Development mode: Returning mock account data");
  
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
      balance_iso_currency_code: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plaid_items: {
        institution_name: 'Mock Bank',
        status: 'active',
        error_message: null
      }
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
      }
    }
  ];
}
