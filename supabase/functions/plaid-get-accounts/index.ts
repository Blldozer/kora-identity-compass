
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
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    console.log("Creating Supabase client");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: 'Missing environment variables' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
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
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!user) {
      console.error("No user found in session");
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'No user found in session' }),
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
          details: accountsError.message,
        }),
        {
          status: 500,
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
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
