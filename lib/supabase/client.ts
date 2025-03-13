import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create a singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 