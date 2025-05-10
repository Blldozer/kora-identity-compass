
// supabase/functions/plaid-get-accounts/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("plaid-get-accounts function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log("Auth header present:", authHeader ? "Yes" : "No");
    
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required', 
          details: 'No authorization header provided. Please login and try again.' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client
    console.log("Creating Supabase client");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error', 
          details: 'Missing environment variables. Please contact support.' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check if we're in development/sandbox mode - useful for debugging
    const isDevMode = Deno.env.get('PLAID_ENV') === 'sandbox';
    console.log("Running in environment:", Deno.env.get('PLAID_ENV') || 'unknown');
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Get authenticated user
    console.log("Getting authenticated user");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed', 
          details: userError.message || 'Unable to verify your identity. Please login again.' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!user) {
      console.error("No user found in session");
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed', 
          details: 'No user found in session. Please login again.' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`User authenticated: ${user.id}`);
    
    const url = new URL(req.url);
    const itemId = url.searchParams.get('item_id');
    
    // Build query to get accounts
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
      .eq('user_id', user.id);
    
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
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve accounts',
          details: accountsError.message || 'Database error when retrieving accounts',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // In development mode with no accounts, provide mock data for testing
    if (isDevMode && (!accounts || accounts.length === 0)) {
      console.log("Development mode: Returning mock account data");
      const mockAccounts = [
        {
          id: 'mock-account-1',
          item_id: 'mock-item-1',
          user_id: user.id,
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
          user_id: user.id,
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
      
      return new Response(
        JSON.stringify({
          success: true,
          accounts: mockAccounts,
          is_mock_data: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if there are any accounts
    if (!accounts || accounts.length === 0) {
      console.log("No accounts found for user");
      return new Response(
        JSON.stringify({
          success: true,
          accounts: [],
          message: "No connected accounts found"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${accounts.length} accounts for user`);
    return new Response(
      JSON.stringify({
        success: true,
        accounts: accounts || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error fetching accounts:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch accounts',
        details: error.message || 'An unexpected error occurred',
        stack: isDevMode ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
