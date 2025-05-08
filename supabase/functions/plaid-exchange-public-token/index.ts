
// supabase/functions/plaid-exchange-public-token/index.ts
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

    // Get public token from request
    const { public_token, institution } = await req.json();
    
    if (!public_token) {
      return new Response(
        JSON.stringify({ error: 'Missing public_token' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get item details
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });

    // Get institution details
    const institutionId = itemResponse.data.item.institution_id || '';
    let institutionName = institution?.name || 'Unknown Institution';
    
    if (institutionId && !institutionName) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ['US'],
        });
        institutionName = instResponse.data.institution.name;
      } catch (error) {
        console.error('Error getting institution details:', error);
      }
    }

    // Store item in database
    const { data: itemData, error: itemError } = await supabaseClient
      .from('plaid_items')
      .insert({
        user_id: user.id,
        plaid_item_id: itemId,
        plaid_access_token: accessToken,
        plaid_institution_id: institutionId,
        institution_name: institutionName,
        status: 'active',
      })
      .select()
      .single();

    if (itemError) {
      throw new Error(`Failed to store Plaid item: ${itemError.message}`);
    }

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Store accounts in database
    const accounts = accountsResponse.data.accounts.map((account) => ({
      item_id: itemData.id,
      user_id: user.id,
      plaid_account_id: account.account_id,
      name: account.name,
      mask: account.mask,
      official_name: account.official_name,
      type: account.type,
      subtype: account.subtype || null,
      balance_available: account.balances.available,
      balance_current: account.balances.current,
      balance_limit: account.balances.limit,
      balance_iso_currency_code: account.balances.iso_currency_code,
    }));

    const { data: accountsData, error: accountsError } = await supabaseClient
      .from('plaid_accounts')
      .insert(accounts)
      .select();

    if (accountsError) {
      throw new Error(`Failed to store accounts: ${accountsError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        item: itemData,
        accounts: accountsData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error exchanging token:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to exchange token',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
