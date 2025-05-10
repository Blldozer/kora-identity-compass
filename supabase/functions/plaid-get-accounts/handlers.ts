
// Request handlers for the plaid-get-accounts function
import { corsHeaders } from "./cors.ts";
import { createSupabaseClient, getAuthenticatedUser, getAuthHeader } from "./auth.ts";
import { getAccounts, generateMockAccounts } from "./accounts.ts";

// Main request handler
export async function handleRequest(req) {
  const isDevMode = Deno.env.get('PLAID_ENV') === 'sandbox';
  console.log("Running in environment:", Deno.env.get('PLAID_ENV') || 'unknown');
  
  try {
    // Authenticate the request
    const authHeader = getAuthHeader(req);
    
    // Create Supabase client
    console.log("Creating Supabase client");
    const supabaseClient = createSupabaseClient(authHeader);
    
    // Get authenticated user
    const user = await getAuthenticatedUser(supabaseClient);

    // Parse URL params
    const url = new URL(req.url);
    const itemId = url.searchParams.get('item_id');
    
    // Get accounts from database
    const accounts = await getAccounts(supabaseClient, user.id, itemId);

    // In development mode with no accounts, provide mock data for testing
    if (isDevMode && accounts.length === 0) {
      const mockAccounts = generateMockAccounts(user.id);
      
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
    if (accounts.length === 0) {
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
        accounts: accounts,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // If the error has a status code, use it
    const status = error.status || 500;
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to fetch accounts',
        details: error.details || 'An unexpected error occurred',
        stack: isDevMode ? error.stack : undefined
      }),
      {
        status: status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
