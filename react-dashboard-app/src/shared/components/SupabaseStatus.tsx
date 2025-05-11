import React, { useState, useEffect } from 'react';
import { testSupabaseConnection, getDatabaseStatus } from '../../services/api/supabaseService';

interface SupabaseStatusProps {
  showDetails?: boolean;
}

/**
 * Component that displays the current Supabase connection status
 */
export const SupabaseStatus: React.FC<SupabaseStatusProps> = ({ showDetails = false }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [details, setDetails] = useState<{
    version: string;
    status: string;
    tables: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const response = await testSupabaseConnection();
        
        if (response.success && response.data) {
          setIsConnected(response.data.connected);
          
          // Get additional details if requested
          if (showDetails && response.data.connected) {
            const statusResponse = await getDatabaseStatus();
            if (statusResponse.success && statusResponse.data) {
              setDetails(statusResponse.data);
            }
          }
        } else {
          setIsConnected(false);
          setError(response.error?.message || 'Failed to connect to Supabase');
        }
      } catch (err) {
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [showDetails]);

  if (isLoading) {
    return (
      <div className="flex items-center text-sm">
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
        <span className="text-gray-500">Checking API connection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-sm">
        <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
        <span className="text-red-600">API error: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center text-sm">
        <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
          Supabase API: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {showDetails && details && (
        <div className="mt-2 text-xs text-gray-600">
          <div>Version: {details.version}</div>
          <div>Status: {details.status}</div>
          {details.tables.length > 0 && (
            <div>
              <div className="font-medium mt-1">Tables:</div>
              <ul className="list-disc list-inside ml-2">
                {details.tables.slice(0, 5).map((table) => (
                  <li key={table}>{table}</li>
                ))}
                {details.tables.length > 5 && <li>...and {details.tables.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 