
// supabase/functions/plaid-create-link-token/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'https://esm.sh/plaid@14.0.0';

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

    // Parse request body for custom configuration
    const requestData = await req.json().catch(() => ({}));
    
    // Create link token request with user's data
    const linkTokenRequest = {
      user: {
        client_user_id: user.id,
      },
      client_name: 'Kora Financial',
      products: requestData.products || ['auth', 'transactions', 'identity'],
      language: 'en',
      country_codes: [CountryCode.Us],
      webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/plaid-webhook`,
      redirect_uri: requestData.redirect_uri,
    };

    // Create link token with Plaid
    const response = await plaidClient.linkTokenCreate(linkTokenRequest);
    
    // Return the link token
    return new Response(
      JSON.stringify({
        link_token: response.data.link_token,
        expiration: response.data.expiration,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating link token:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create link token',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
