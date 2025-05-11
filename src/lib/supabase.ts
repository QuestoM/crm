import { supabase, supabaseClient } from '../services/supabase/client';

export { supabase, supabaseClient };

/**
 * Helper function to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    success: false,
    error: {
      message: error?.message || 'An error occurred with the database',
      code: error?.code || 'supabase_error'
    }
  };
};

/**
 * Create a success response
 */
export const createSuccessResponse = <T>(data: T) => {
  return {
    success: true,
    data
  };
};

export default {
  supabase,
  supabaseClient,
  handleSupabaseError,
  createSuccessResponse
}; 