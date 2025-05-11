/**
 * Supabase configuration
 * This file is used to configure the Supabase client with the correct environment variables
 */

// Default values from project
const DEFAULT_SUPABASE_URL = 'https://rhpntgjnzhtxswanibep.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG50Z2puemh0eHN3YW5pYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIzMzMxOTUsImV4cCI6MTcwNzg4NTE5NX0.hgDSLHdXwVJLKeMwXmfu_QNb_DaOVhAyf0NNHQOqgPQ';

// Use environment variables if they exist, otherwise use defaults
export const supabaseUrl = DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY; 