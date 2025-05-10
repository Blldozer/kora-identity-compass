
// Main entry point for the plaid-get-accounts function
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { handleRequest } from "./handlers.ts";

serve(async (req) => {
  console.log("plaid-get-accounts function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await handleRequest(req);
  } catch (error) {
    console.error('Unexpected error in plaid-get-accounts:', error);
    const isDevMode = Deno.env.get('PLAID_ENV') === 'sandbox';
    
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
