// Database setup script for Water Filter CRM
// This script creates all necessary tables and seed data in Supabase

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in .env file');
  console.error('Please update your .env file with valid credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database schema...');
  
  try {
    // Create customers table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'customers',
      definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        status TEXT DEFAULT 'active',
        source TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });
    
    // Create leads table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'leads',
      definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        source TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });
    
    // Create products table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'products',
      definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category TEXT,
        stock INTEGER DEFAULT 0,
        maintenance_interval INTEGER,
        installation_time INTEGER,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });
    
    // Create orders table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'orders',
      definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id uuid REFERENCES customers(id),
        status TEXT DEFAULT 'pending',
        amount DECIMAL(10,2) NOT NULL,
        payment_status TEXT DEFAULT 'unpaid',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        scheduled_date TIMESTAMP WITH TIME ZONE
      `
    });
    
    // Create order_items table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'order_items',
      definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id uuid REFERENCES orders(id),
        product_id uuid REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });
    
    // Create tasks table
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'tasks',
      definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date TIMESTAMP WITH TIME ZONE,
        assigned_to TEXT,
        customer_id uuid REFERENCES customers(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `
    });
    
    console.log('Database schema created successfully!');
    
    // Insert seed data
    await insertSeedData();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  }
}

async function insertSeedData() {
  console.log('Inserting seed data...');
  
  // Sample product categories for water filter business
  const categories = ['filter', 'purifier', 'softener', 'cartridge', 'accessory', 'maintenance'];
  
  // Insert products
  const { error: productsError } = await supabase.from('products').insert([
    {
      name: 'Premium Water Filter System',
      description: 'High capacity under-sink water filtration system with 5 stages',
      price: 1299.99,
      category: 'filter',
      stock: 15,
      maintenance_interval: 180, // days
      installation_time: 60, // minutes
      is_active: true
    },
    {
      name: 'Basic Water Filter',
      description: 'Entry-level water filter for residential use',
      price: 499.99,
      category: 'filter',
      stock: 25,
      maintenance_interval: 90,
      installation_time: 30,
      is_active: true
    },
    {
      name: 'Replacement Filter Cartridge',
      description: 'Standard replacement cartridge for our filter systems',
      price: 69.99,
      category: 'cartridge',
      stock: 100,
      maintenance_interval: 90,
      is_active: true
    },
    {
      name: 'Water Softener System',
      description: 'Whole-house water softening system for hard water',
      price: 1899.99,
      category: 'softener',
      stock: 8,
      maintenance_interval: 365,
      installation_time: 120,
      is_active: true
    },
    {
      name: 'Annual Maintenance Kit',
      description: 'Complete kit for annual filter system maintenance',
      price: 149.99,
      category: 'maintenance',
      stock: 40,
      is_active: true
    },
  ]);
  
  if (productsError) {
    console.error('Error inserting products:', productsError.message);
    return;
  }
  
  // Insert sample customers
  const { error: customersError } = await supabase.from('customers').insert([
    {
      first_name: 'דוד',
      last_name: 'כהן',
      email: 'david@example.com',
      phone: '052-1234567',
      address: 'רחוב הרצל 15',
      city: 'תל אביב',
      postal_code: '6123001',
      status: 'active',
      source: 'website',
      notes: 'מעוניין במערכת סינון מים לכל הבית'
    },
    {
      first_name: 'שרה',
      last_name: 'לוי',
      email: 'sarah@example.com',
      phone: '050-9876543',
      address: 'רחוב בן יהודה 42',
      city: 'ירושלים',
      postal_code: '9103001',
      status: 'active',
      source: 'referral',
      notes: 'התקנה בוצעה ב-15/3/2023'
    },
    {
      first_name: 'משה',
      last_name: 'ישראלי',
      email: 'moshe@example.com',
      phone: '054-5551234',
      address: 'רחוב ויצמן 30',
      city: 'חיפה',
      postal_code: '3303001',
      status: 'inactive',
      source: 'advertisement',
      notes: 'לקוח לא פעיל מאז 2022'
    },
  ]);
  
  if (customersError) {
    console.error('Error inserting customers:', customersError.message);
    return;
  }
  
  // Insert sample leads
  const { error: leadsError } = await supabase.from('leads').insert([
    {
      first_name: 'יעל',
      last_name: 'גולן',
      email: 'yael@example.com',
      phone: '053-7778888',
      status: 'new',
      source: 'website',
      notes: 'מעוניינת במידע על מערכות סינון למים'
    },
    {
      first_name: 'עמית',
      last_name: 'ברק',
      email: 'amit@example.com',
      phone: '058-1112222',
      status: 'contacted',
      source: 'social media',
      notes: 'הביע עניין במערכת לדירה חדשה'
    },
    {
      first_name: 'אורי',
      last_name: 'אבני',
      email: 'uri@example.com',
      phone: '052-3334444',
      status: 'qualified',
      source: 'trade show',
      notes: 'פגישה נקבעה לשבוע הבא'
    },
  ]);
  
  if (leadsError) {
    console.error('Error inserting leads:', leadsError.message);
    return;
  }
  
  console.log('Seed data inserted successfully!');
}

// Run the setup
setupDatabase(); 