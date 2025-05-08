
// supabase/functions/plaid-get-transactions/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Parse URL params
    const url = new URL(req.url);
    const accountId = url.searchParams.get('account_id');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabaseClient
      .from('plaid_transactions')
      .select(`
        *,
        plaid_accounts (
          name,
          mask,
          type,
          subtype
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    // Apply filters if provided
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: transactions, error: transactionsError, count } = await query;

    if (transactionsError) {
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve transactions',
          details: transactionsError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get count of all transactions matching the filters
    const countQuery = supabaseClient
      .from('plaid_transactions')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);
    
    if (accountId) {
      countQuery.eq('account_id', accountId);
    }
    
    if (startDate) {
      countQuery.gte('date', startDate);
    }
    
    if (endDate) {
      countQuery.lte('date', endDate);
    }
    
    const { count: totalCount } = await countQuery;

    return new Response(
      JSON.stringify({
        success: true,
        transactions: transactions || [],
        pagination: {
          total: totalCount,
          limit,
          offset,
          has_more: (offset + limit) < totalCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch transactions',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
