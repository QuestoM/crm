import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const supabaseUrl = 'https://rhpntgjnzhtxswanibep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG50Z2puemh0eHN3YW5pYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIzMzMxOTUsImV4cCI6MTcwNzg4NTE5NX0.hgDSLHdXwVJLKeMwXmfuYqG6TG1oF0o7WPSHHjVcCGo';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 