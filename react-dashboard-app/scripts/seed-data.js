/**
 * Supabase Database Seed Script
 * 
 * This script populates the Supabase database with demo data for the CRM application.
 * It creates tables if they don't exist and inserts sample data.
 * 
 * Usage: 
 * node scripts/seed-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const faker = require('faker');

// Initialize Supabase client - replace with your credentials
const supabaseUrl = 'https://rhpntgjnzhtxswanibep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG50Z2puemh0eHN3YW5pYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTIzMzMxOTUsImV4cCI6MTcwNzg4NTE5NX0.hgDSLHdXwVJLKeMwXmfu_QNb_DaOVhAyf0NNHQOqgPQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Set up consistent Hebrew locale
faker.locale = 'he';

// Configuration
const CUSTOMER_COUNT = 50;
const LEAD_COUNT = 30;
const PRODUCT_COUNT = 20;
const ORDER_COUNT = 40;
const TASK_COUNT = 25;

// Helper function to create tables
async function createTables() {
  console.log('🔧 Creating tables if they don\'t exist...');
  
  // Define table creation SQL
  const tables = [
    // Customers table
    `CREATE TABLE IF NOT EXISTS customers (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      status TEXT CHECK (status IN ('active', 'inactive', 'prospect')) DEFAULT 'active',
      total_orders INTEGER DEFAULT 0,
      total_spent DECIMAL(10,2) DEFAULT 0.0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Leads table
    `CREATE TABLE IF NOT EXISTS leads (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      source TEXT,
      status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'lost', 'converted')) DEFAULT 'new',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Products table
    `CREATE TABLE IF NOT EXISTS products (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      type TEXT,
      inventory INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id uuid REFERENCES customers(id),
      amount DECIMAL(10,2) NOT NULL,
      status TEXT CHECK (status IN ('pending', 'shipped', 'completed', 'cancelled')) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    
    // Tasks table
    `CREATE TABLE IF NOT EXISTS tasks (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date TIMESTAMP WITH TIME ZONE,
      priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
      related_to_type TEXT,
      related_to_id uuid,
      assigned_to TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`
  ];

  // Execute table creation
  for (const sql of tables) {
    const { error } = await supabase.rpc('custom_sql', { query: sql });
    if (error) {
      console.error('Error creating table:', error);
      return false;
    }
  }
  
  console.log('✅ Tables created successfully');
  return true;
}

// Generate random customers
async function generateCustomers() {
  console.log(`🧑‍🤝‍🧑 Generating ${CUSTOMER_COUNT} customers...`);
  
  const customers = [];
  
  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    
    customers.push({
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email(firstName, lastName),
      phone: faker.phone.phoneNumber('05#-###-####'),
      address: faker.address.streetAddress() + ', ' + faker.address.city(),
      status: faker.random.arrayElement(['active', 'inactive', 'prospect']),
      total_orders: 0,
      total_spent: 0,
      created_at: faker.date.past(2)
    });
  }
  
  const { data, error } = await supabase.from('customers').insert(customers);
  
  if (error) {
    console.error('Error inserting customers:', error);
    return [];
  }
  
  console.log(`✅ ${customers.length} customers inserted`);
  return customers;
}

// Generate random leads
async function generateLeads() {
  console.log(`🎯 Generating ${LEAD_COUNT} leads...`);
  
  const leads = [];
  
  for (let i = 0; i < LEAD_COUNT; i++) {
    const name = faker.name.findName();
    const company = Math.random() > 0.3 ? faker.company.companyName() : null;
    
    leads.push({
      name,
      company,
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber('05#-###-####'),
      source: faker.random.arrayElement(['website', 'referral', 'advertisement', 'direct', 'social']),
      status: faker.random.arrayElement(['new', 'contacted', 'qualified', 'lost', 'converted']),
      created_at: faker.date.past(1)
    });
  }
  
  const { data, error } = await supabase.from('leads').insert(leads);
  
  if (error) {
    console.error('Error inserting leads:', error);
    return [];
  }
  
  console.log(`✅ ${leads.length} leads inserted`);
  return leads;
}

// Generate random products
async function generateProducts() {
  console.log(`🛍️ Generating ${PRODUCT_COUNT} products...`);
  
  const productTypes = ['מסנן', 'מטהר', 'מיכל', 'ברז', 'אביזר'];
  const products = [];
  
  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const type = faker.random.arrayElement(productTypes);
    const name = type + ' ' + faker.commerce.productName();
    
    products.push({
      name,
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price(100, 5000, 2)),
      type,
      inventory: faker.datatype.number({ min: 0, max: 100 }),
      created_at: faker.date.past(1)
    });
  }
  
  const { data, error } = await supabase.from('products').insert(products);
  
  if (error) {
    console.error('Error inserting products:', error);
    return [];
  }
  
  console.log(`✅ ${products.length} products inserted`);
  return products;
}

// Get all customers for creating orders
async function getCustomers() {
  const { data, error } = await supabase.from('customers').select('id');
  
  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  
  return data;
}

// Generate random orders
async function generateOrders(customers) {
  if (!customers.length) {
    console.log('⚠️ No customers found, skipping orders');
    return [];
  }
  
  console.log(`🛒 Generating ${ORDER_COUNT} orders...`);
  
  const orders = [];
  const statuses = ['pending', 'shipped', 'completed', 'cancelled'];
  
  // Track customer order totals for updating later
  const customerTotals = {};
  
  for (let i = 0; i < ORDER_COUNT; i++) {
    const customerId = faker.random.arrayElement(customers).id;
    const status = faker.random.arrayElement(statuses);
    const amount = parseFloat(faker.commerce.price(200, 10000, 2));
    
    // Update customer totals
    if (!customerTotals[customerId]) {
      customerTotals[customerId] = { orders: 0, spent: 0 };
    }
    
    if (status !== 'cancelled') {
      customerTotals[customerId].orders += 1;
      customerTotals[customerId].spent += amount;
    }
    
    orders.push({
      customer_id: customerId,
      amount,
      status,
      created_at: faker.date.past(1)
    });
  }
  
  // Insert orders
  const { data, error } = await supabase.from('orders').insert(orders);
  
  if (error) {
    console.error('Error inserting orders:', error);
    return [];
  }
  
  // Update customer order totals
  for (const [customerId, totals] of Object.entries(customerTotals)) {
    const { error } = await supabase
      .from('customers')
      .update({ 
        total_orders: totals.orders, 
        total_spent: totals.spent.toFixed(2) 
      })
      .eq('id', customerId);
    
    if (error) {
      console.error(`Error updating customer ${customerId}:`, error);
    }
  }
  
  console.log(`✅ ${orders.length} orders inserted and customer totals updated`);
  return data;
}

// Generate random tasks
async function generateTasks(customers) {
  console.log(`📋 Generating ${TASK_COUNT} tasks...`);
  
  const tasks = [];
  const priorities = ['low', 'medium', 'high'];
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  
  for (let i = 0; i < TASK_COUNT; i++) {
    const relatedToCustomer = Math.random() > 0.5 && customers.length > 0;
    
    tasks.push({
      title: faker.random.words(3),
      description: faker.lorem.sentences(2),
      due_date: faker.date.future(1),
      priority: faker.random.arrayElement(priorities),
      status: faker.random.arrayElement(statuses),
      related_to_type: relatedToCustomer ? 'customer' : null,
      related_to_id: relatedToCustomer ? faker.random.arrayElement(customers).id : null,
      assigned_to: faker.name.findName(),
      created_at: faker.date.past(1)
    });
  }
  
  const { data, error } = await supabase.from('tasks').insert(tasks);
  
  if (error) {
    console.error('Error inserting tasks:', error);
    return [];
  }
  
  console.log(`✅ ${tasks.length} tasks inserted`);
  return data;
}

// Main function to run the seed script
async function main() {
  console.log('🚀 Starting database seed process...');
  
  // Create tables
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.error('❌ Failed to create tables, aborting seed');
    return;
  }
  
  // Check if data already exists
  const { count: customerCount, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error checking existing data:', error);
    return;
  }
  
  if (customerCount > 0) {
    console.log('⚠️ Data already exists in the database');
    const confirmation = await promptYesNo('Do you want to proceed and add more data?');
    
    if (!confirmation) {
      console.log('❌ Seed process cancelled');
      return;
    }
  }
  
  // Generate data
  await generateLeads();
  const customers = await getCustomers();
  await generateProducts();
  await generateOrders(customers);
  await generateTasks(customers);
  
  console.log('✅ Database seed completed successfully!');
}

// Simple prompt for confirmation (always returns true in this version)
async function promptYesNo(question) {
  console.log(`${question} (Y/n)`);
  return true; // In a browser environment, we just proceed
}

// Run the seed script
main()
  .catch(err => {
    console.error('Seed process failed with error:', err);
  }); 