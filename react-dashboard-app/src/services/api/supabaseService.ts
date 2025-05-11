import { supabase } from '../supabase/client';

/**
 * Service response type
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Test the connection to Supabase
 */
export async function testSupabaseConnection(): Promise<ServiceResponse<{ connected: boolean }>> {
  try {
    // Simple query to test the connection
    const { data, error } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'connection_error',
          message: error.message,
        },
      };
    }
    
    return {
      success: true,
      data: {
        connected: true,
      },
    };
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return {
      success: false,
      error: {
        code: 'connection_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      },
    };
  }
}

/**
 * Get the database status
 */
export async function getDatabaseStatus(): Promise<ServiceResponse<{
  version: string;
  status: string;
  tables: string[];
}>> {
  try {
    // Check which tables exist
    const tableNames = [
      'customers', 
      'leads', 
      'products', 
      'orders', 
      'tasks',
      'contacts',
    ];
    
    const tableChecks = await Promise.all(
      tableNames.map(async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        return error ? null : table;
      })
    );
    
    const existingTables = tableChecks.filter(Boolean) as string[];
    
    // Get database info
    const { data: versionData, error: versionError } = await supabase.rpc('pg_version');
    
    if (versionError) {
      return {
        success: false,
        error: {
          code: 'db_info_error',
          message: versionError.message,
        },
      };
    }
    
    return {
      success: true,
      data: {
        version: versionData || 'Unknown',
        status: existingTables.length > 0 ? 'Available' : 'Tables missing',
        tables: existingTables,
      },
    };
  } catch (err) {
    console.error('Error getting database status:', err);
    return {
      success: false,
      error: {
        code: 'db_status_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      },
    };
  }
} 