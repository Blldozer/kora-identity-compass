
// Authentication utilities for the plaid-get-accounts function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "./cors.ts";

// Create an authenticated Supabase client
export const createSupabaseClient = (authHeader: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    { global: { headers: { Authorization: authHeader } } }
  );
};

// Verify the authenticated user
export async function getAuthenticatedUser(supabaseClient) {
  console.log("Getting authenticated user");
  
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError) {
    console.error("Error getting user:", userError);
    throw {
      status: 401,
      message: 'Authentication failed', 
      details: userError.message || 'Unable to verify your identity. Please login again.'
    };
  }
  
  if (!user) {
    console.error("No user found in session");
    throw {
      status: 401,
      message: 'Authentication failed', 
      details: 'No user found in session. Please login again.'
    };
  }

  console.log(`User authenticated: ${user.id}`);
  return user;
}

// Check authorization header
export function getAuthHeader(req) {
  const authHeader = req.headers.get('Authorization');
  console.log("Auth header present:", authHeader ? "Yes" : "No");
  
  if (!authHeader) {
    console.error("No authorization header provided");
    throw {
      status: 401,
      message: 'Authentication required', 
      details: 'No authorization header provided. Please login and try again.'
    };
  }
  
  return authHeader;
}
