import React from 'react';
import { MainLayout } from '../../AppLayout';
import { SupabaseStatus } from '../../shared/components/SupabaseStatus';

/**
 * Database status page for administrators
 * Shows detailed information about Supabase connection
 */
const DatabaseStatusPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Database Status</h1>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <SupabaseStatus showDetails={true} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3">Connection Information</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Provider:</strong> Supabase
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Project:</strong> rhpntgjnzhtxswanibep
            </p>
            <p className="text-sm text-gray-600">
              <strong>Region:</strong> AWS (ap-southeast-1)
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3">Database Information</h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Type:</strong> PostgreSQL
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Connection:</strong> Direct API
            </p>
            <p className="text-sm text-gray-600">
              <strong>Access Level:</strong> Anonymous (public)
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3">API Endpoint</h2>
          <div className="bg-gray-800 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
            <code>https://rhpntgjnzhtxswanibep.supabase.co</code>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This is the base URL for all API requests to the Supabase project.
          </p>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Troubleshooting</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>Check that your Supabase project is active and not in maintenance mode</li>
            <li>Verify your API keys in the application configuration</li>
            <li>Ensure necessary tables exist in the database</li>
            <li>Use the seed-db script to populate test data: <code className="bg-gray-100 px-1 rounded">npm run seed-db</code></li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default DatabaseStatusPage; 