import fs from 'fs';
import path from 'path';

/**
 * Load environment variables from MCP configuration
 * This allows us to use environment variables from the MCP configuration
 */
export const loadMcpEnvironment = () => {
  try {
    // Try to read the MCP config file
    const mcpPath = path.resolve(process.cwd(), '.cursor', 'mcp.json');
    
    if (fs.existsSync(mcpPath)) {
      const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
      
      // Extract Supabase connection string if available
      if (mcpConfig?.mcpServers?.supabase?.args?.[2]) {
        process.env.SUPABASE_CONNECTION_STRING = mcpConfig.mcpServers.supabase.args[2];
      }
    }
  } catch (error) {
    console.error('Error loading MCP environment:', error);
  }
};

// Initialize environment variables
export const initEnvironment = () => {
  // Load MCP environment variables
  loadMcpEnvironment();
  
  // Add other environment initialization here if needed
}; 