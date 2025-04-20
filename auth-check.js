// Simple script to check if your Supabase auth is working correctly
const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and anon key from .env file or config
async function loadEnvConfig() {
  try {
    // Try to read from .env file if it exists
    const fs = require('fs');
    const path = require('path');
    const dotenv = require('dotenv');
    
    // Look for .env file
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
    
    // Look for .env.local file
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      dotenv.config({ path: envLocalPath });
    }
    
    return {
      url: process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
    };
  } catch (error) {
    console.error('Error loading environment variables:', error);
    return { url: null, key: null };
  }
}

async function checkAuth() {
  try {
    // Load environment config
    const config = await loadEnvConfig();
    
    if (!config.url || !config.key) {
      console.error('Supabase URL or key not found in environment variables.');
      console.log('Please provide them manually:');
      
      // Ask for manual input if env vars not found
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const url = await new Promise(resolve => {
        readline.question('Supabase URL: ', resolve);
      });
      
      const key = await new Promise(resolve => {
        readline.question('Supabase anon key: ', resolve);
      });
      
      readline.close();
      
      config.url = url;
      config.key = key;
    }
    
    // Initialize Supabase client
    const supabase = createClient(config.url, config.key);
    
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
      
      // Suggest creating a profile
      console.log("\n🔍 Would you like to create a profile for this user? (y/n)");
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('> ', resolve);
      });
      
      if (answer.toLowerCase() === 'y') {
        console.log("Creating profile...");
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            email: userData.user.email
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating profile:", createError);
        } else {
          console.log("✅ Profile created successfully:", createdProfile);
        }
      }
      
      readline.close();
    } else {
      console.log("✅ Profile found in profiles table:", profile);
    }
  } catch (error) {
    console.error("Unexpected error during auth check:", error);
  }
}

// Run the check
checkAuth();
