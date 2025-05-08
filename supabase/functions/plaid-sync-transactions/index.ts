
// supabase/functions/plaid-sync-transactions/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@14.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
      'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get request parameters
    const { item_id } = await req.json();
    
    if (!item_id) {
      return new Response(
        JSON.stringify({ error: 'Missing item_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the Plaid item
    const { data: item, error: itemError } = await supabaseClient
      .from('plaid_items')
      .select('*')
      .eq('id', item_id)
      .eq('user_id', user.id)
      .single();

    if (itemError || !item) {
      return new Response(
        JSON.stringify({
          error: 'Item not found or access denied',
          details: itemError?.message,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get accounts for this item
    const { data: accounts, error: accountsError } = await supabaseClient
      .from('plaid_accounts')
      .select('*')
      .eq('item_id', item_id)
      .eq('user_id', user.id);

    if (accountsError || !accounts) {
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve accounts',
          details: accountsError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get transactions from Plaid (last 30 days by default)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: item.plaid_access_token,
      start_date: startDate,
      end_date: endDate,
    });

    // Map account IDs from Plaid to our database IDs
    const accountMap = {};
    accounts.forEach(account => {
      accountMap[account.plaid_account_id] = account.id;
    });

    // Prepare transactions for inserting into our database
    const transactions = transactionsResponse.data.transactions.map(transaction => ({
      account_id: accountMap[transaction.account_id],
      user_id: user.id,
      plaid_transaction_id: transaction.transaction_id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.date,
      pending: transaction.pending,
      category: transaction.category || [],
      merchant_name: transaction.merchant_name,
      payment_channel: transaction.payment_channel,
      location: transaction.location || {},
    }));

    // Insert transactions in batches to avoid hitting limits
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      
      // Upsert transactions (insert or update if already exists)
      const { data, error } = await supabaseClient
        .from('plaid_transactions')
        .upsert(batch, { onConflict: 'plaid_transaction_id' })
        .select();
      
      if (error) {
        console.error('Error inserting transactions batch:', error);
      } else if (data) {
        results.push(...data);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactions_added: results.length,
        total_transactions: transactionsResponse.data.total_transactions,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to sync transactions',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
