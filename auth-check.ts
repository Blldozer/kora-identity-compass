// Simple script to check if your Supabase auth is working correctly
import { supabase } from "./src/integrations/supabase/client";

async function checkAuth() {
  try {
    // Get the current user's session
    console.log("Checking current auth session...");
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      return;
    }
    
    if (!sessionData?.session) {
      console.log("No active session found. You need to be logged in to check auth.");
      return;
    }
    
    // Get the current user
    console.log("Session found, checking user details...");
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      return;
    }
    
    if (!userData?.user) {
      console.log("No user found despite having a session.");
      return;
    }
    
    // User exists in auth
    console.log("✅ Auth is working correctly! User found:");
    console.log({
      id: userData.user.id,
      email: userData.user.email,
      emailConfirmed: userData.user.email_confirmed_at !== null,
      lastSignIn: userData.user.last_sign_in_at,
      createdAt: userData.user.created_at
    });
    
    // Check if profile exists
    console.log("\nChecking if profile exists in profiles table...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error checking profile:", profileError);
      return;
    }
    
    if (!profile) {
      console.log("❌ No profile found for this user in the profiles table.");
      console.log("This explains why you can't find your account in the profiles DB.");
    } else {
      console.log("✅ Profile found in profiles table:", profile);
    }
  } catch (error) {
    console.error("Unexpected error during auth check:", error);
  }
}

// Run the check
checkAuth();
