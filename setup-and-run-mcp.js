const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Client } = require('pg');

// Read MCP configuration
const getMcpConfig = () => {
  try {
    const mcpPath = path.resolve(__dirname, '.cursor', 'mcp.json');
    
    if (fs.existsSync(mcpPath)) {
      const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
      
      if (mcpConfig?.mcpServers?.supabase?.args?.[2]) {
        return {
          connectionString: mcpConfig.mcpServers.supabase.args[2],
          command: mcpConfig.mcpServers.supabase.command,
          args: mcpConfig.mcpServers.supabase.args
        };
      }
    }
    
    throw new Error('MCP configuration not found or invalid');
  } catch (error) {
    console.error('Error reading MCP configuration:', error);
    process.exit(1);
  }
};

// Connect to database and initialize schema
const initializeDatabase = async (connectionString) => {
  const client = new Client({ connectionString });
  
  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    
    console.log('Reading SQL script...');
    const sqlScript = fs.readFileSync(path.resolve(__dirname, 'setup-database.sql'), 'utf8');
    
    console.log('Executing SQL script to initialize database schema...');
    await client.query(sqlScript);
    
    console.log('Database schema initialized successfully');
    
    // Add sample data if needed
    console.log('Adding sample data...');
    await addSampleData(client);
    
    console.log('Sample data added successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.end();
  }
};

// Add sample data for testing
const addSampleData = async (client) => {
  // Check if we already have users
  const { rows: userCount } = await client.query('SELECT COUNT(*) FROM users');
  
  if (parseInt(userCount[0].count) > 0) {
    console.log('Sample data already exists, skipping...');
    return;
  }
  
  // Add some sample users
  await client.query(`
    INSERT INTO users (first_name, last_name, email, role)
    VALUES 
      ('Admin', 'User', 'admin@example.com', 'admin'),
      ('Sales', 'Person', 'sales@example.com', 'sales'),
      ('Tech', 'Support', 'support@example.com', 'technician')
  `);
  
  // Add some sample products
  await client.query(`
    INSERT INTO products (name, sku, description, price, cost, category, warranty_months)
    VALUES 
      ('Water Filter Standard', 'WF-STD-001', 'Standard home water filter system', 599.99, 299.99, 'water_filter', 12),
      ('Water Filter Premium', 'WF-PRM-001', 'Premium home water filter system with extra filtration', 899.99, 449.99, 'water_filter', 24),
      ('Water Bar Basic', 'WB-BSC-001', 'Basic water bar for home or office', 1299.99, 699.99, 'water_bar', 12),
      ('Replacement Filter', 'RF-STD-001', 'Standard replacement filter', 49.99, 19.99, 'replacement_filter', 6)
  `);
  
  // Add inventory for products
  await client.query(`
    INSERT INTO inventory (product_id, quantity, min_threshold)
    SELECT id, 50, 10 FROM products
  `);
  
  // Add a package
  await client.query(`
    INSERT INTO packages (name, description, base_price)
    VALUES ('Home Starter Kit', 'Complete home water filter system with spare filter', 649.99)
  `);
  
  // Add package items
  await client.query(`
    INSERT INTO package_items (package_id, product_id, quantity)
    SELECT 
      (SELECT id FROM packages LIMIT 1),
      id,
      1
    FROM products WHERE sku = 'WF-STD-001'
    UNION ALL
    SELECT 
      (SELECT id FROM packages LIMIT 1),
      id,
      2
    FROM products WHERE sku = 'RF-STD-001'
  `);
  
  // Add some sample leads
  await client.query(`
    INSERT INTO leads (first_name, last_name, phone_number, email, lead_source, status, assigned_to)
    VALUES 
      ('יעקב', 'כהן', '0501234567', 'yaakov@example.com', 'website', 'new', (SELECT id FROM users WHERE role = 'sales' LIMIT 1)),
      ('שרה', 'לוי', '0527654321', 'sara@example.com', 'phone_call', 'contacted', (SELECT id FROM users WHERE role = 'sales' LIMIT 1)),
      ('משה', 'ישראלי', '0541112222', 'moshe@example.com', 'referral', 'qualified', (SELECT id FROM users WHERE role = 'sales' LIMIT 1))
  `);
  
  // Convert a lead to customer
  await client.query(`
    INSERT INTO customers (first_name, last_name, phone_number, email, lead_id)
    SELECT first_name, last_name, phone_number, email, id 
    FROM leads 
    WHERE status = 'qualified' 
    LIMIT 1
  `);
  
  // Add a technician
  await client.query(`
    INSERT INTO technicians (first_name, last_name, email, phone_number, status, skills)
    VALUES ('דוד', 'אברהם', 'david@example.com', '0551234567', 'active', '{"water_filter": true, "water_bar": true}')
  `);
};

// Run the MCP server
const runMcpServer = (command, args) => {
  console.log(`Starting MCP server with command: ${command} ${args.join(' ')}`);
  
  const mcp = spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });
  
  mcp.on('error', (error) => {
    console.error('Error starting MCP server:', error);
  });
  
  mcp.on('close', (code) => {
    console.log(`MCP server exited with code ${code}`);
  });
  
  // Handle termination signals
  process.on('SIGINT', () => {
    console.log('Stopping MCP server...');
    mcp.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Stopping MCP server...');
    mcp.kill('SIGTERM');
  });
};

// Main function
const main = async () => {
  try {
    // Get MCP configuration
    const mcpConfig = getMcpConfig();
    
    // Initialize the database
    await initializeDatabase(mcpConfig.connectionString);
    
    // Run the MCP server
    runMcpServer(mcpConfig.command, mcpConfig.args);
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
};

// Run the main function
main(); 