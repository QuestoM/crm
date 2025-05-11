import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './config';

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if a table exists
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    return !error;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    return false;
  }
}; 