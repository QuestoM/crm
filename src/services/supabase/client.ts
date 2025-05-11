import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Support both variable naming conventions: REACT_APP_ and NEXT_PUBLIC_
const supabaseUrl = 
  process.env.REACT_APP_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://rhpntgjnzhtxswanibep.supabase.co';

const supabaseKey = 
  process.env.REACT_APP_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG50Z2puemh0eHN3YW5pYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDUwMDEsImV4cCI6MjA1OTA4MTAwMX0.GQ5JrsjWIMrg0atDiMFz6NCWH7lDT-AJd3lTNCVZq7Y';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
// Export with the name supabaseClient for compatibility with existing code
export const supabaseClient = supabase;

// Log success message
console.log('Supabase client initialized successfully!');
console.log(`Connected to: ${supabaseUrl}`);

// Add basic error handling for common issues
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed successfully');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated successfully');
  }
}); 