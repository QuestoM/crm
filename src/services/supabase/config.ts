/**
 * Supabase configuration
 * This file is used to configure the Supabase client with the correct environment variables
 */

// Default environment variables for local development
const DEFAULT_SUPABASE_URL = 'https://rhpntgjnzhtxswanibep.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG50Z2puemh0eHN3YW5pYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIzMzMxOTUsImV4cCI6MTcwNzg4NTE5NX0.hgDSLHdXwVJLKeMwXmfuYqG6TG1oF0o7WPSHHjVcCGo';

// Parse connection string if available
// Format: postgresql://postgres:{PASSWORD}@db.rhpntgjnzhtxswanibep.supabase.co:5432/postgres
export const parseSupabaseConfig = () => {
  try {
    // Check if we have connection string from MCP
    const mcpConnection = process.env.SUPABASE_CONNECTION_STRING;
    
    if (!mcpConnection) {
      // Fall back to default environment variables
      return {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
      };
    }
    
    // Extract project reference from connection string
    const match = mcpConnection.match(/db\.([a-zA-Z0-9]+)\.supabase\.co/);
    const projectRef = match ? match[1] : null;
    
    if (!projectRef) {
      throw new Error('Could not extract project reference from connection string');
    }
    
    return {
      supabaseUrl: `https://${projectRef}.supabase.co`,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    };
  } catch (error) {
    console.error('Error parsing Supabase connection string:', error);
    
    // Fall back to default environment variables
    return {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    };
  }
};

// Get Supabase configuration
export const { supabaseUrl, supabaseAnonKey } = parseSupabaseConfig(); 