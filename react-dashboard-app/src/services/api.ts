// Placeholder for API client (e.g., Supabase client)
const apiClient = {
  from: (table: string) => ({
    select: async (fields = '*') => {
      console.log(`Mock API: SELECT ${fields} FROM ${table}`);
      await new Promise(res => setTimeout(res, 300)); // Simulate network delay
      // Return mock data based on table
      if (table === 'leads') {
        return { data: mockLeadsData, error: null };
      }
      if (table === 'customers') {
          return { data: mockCustomersData, error: null };
      }
      return { data: [], error: null };
    },
    // Add mock insert, update, delete as needed
    // insert: async (data) => { ... }
    // update: async (data) => { ... }
    // delete: async () => { ... }
  }),
};

// --- Define Interfaces for Mock Data ---
interface MockLead {
    id: string;
    name: string;
    company?: string;
    email: string;
    phone: string;
    status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
    source: string;
    created_at: string; // Use ISO string for mock data consistency
}

interface MockCustomer {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    status: 'active' | 'inactive' | 'prospect';
    total_orders: number;
    total_spent: number;
    created_at: string; // Use ISO string
}

// --- Mock Data ---
const mockLeadsData: MockLead[] = [
  { id: '1', name: 'משה כהן', company: 'כהן בע"מ', email: 'moshe@cohen.co.il', phone: '050-1112222', status: 'new', source: 'אתר', created_at: new Date(2024, 3, 1).toISOString() },
  { id: '2', name: 'שרה לוי', email: 'sara@levi.com', phone: '052-3334444', status: 'contacted', source: 'טלפון', created_at: new Date(2024, 3, 5).toISOString() },
  { id: '3', name: 'דוד ישראלי', company: 'ישראלי ובניו', email: 'david@israeli.org', phone: '054-5556666', status: 'qualified', source: 'המלצה', created_at: new Date(2024, 2, 20).toISOString() },
  { id: '4', name: 'רותי שמש', email: 'ruti@shemesh.net', phone: '053-7778888', status: 'new', source: 'כנס', created_at: new Date(2024, 3, 10).toISOString() },
  { id: '5', name: 'אבי גולן', company: 'גולן הובלות', email: 'avi@golan.biz', phone: '058-9990000', status: 'lost', source: 'פייסבוק', created_at: new Date(2024, 1, 15).toISOString() },
  // Add more mock data if needed to test pagination
];

const mockCustomersData: MockCustomer[] = [
  { id: '101', first_name: 'יעל', last_name: 'גורן', email: 'yael@goren.com', phone: '050-2223333', address: 'הפרחים 1, חיפה', status: 'active', total_orders: 5, total_spent: 3500, created_at: new Date(2023, 10, 15).toISOString() },
  { id: '102', first_name: 'איתן', last_name: 'ברק', email: 'eitan@barak.net', phone: '052-4445555', status: 'active', total_orders: 2, total_spent: 1200, created_at: new Date(2024, 0, 5).toISOString() },
  { id: '103', first_name: 'נועה', last_name: 'אשכנזי', email: 'noa@ashkenazi.org', phone: '054-6667777', address: 'הנרקיסים 12, באר שבע', status: 'inactive', total_orders: 1, total_spent: 450, created_at: new Date(2023, 5, 1).toISOString() },
  { id: '104', first_name: 'לירון', last_name: 'פרידמן', email: 'liron@friedman.io', phone: '053-8889999', status: 'prospect', total_orders: 0, total_spent: 0, created_at: new Date(2024, 2, 28).toISOString() },
];

// --- Service Functions ---

// Example: Fetch Leads with basic filtering/sorting/pagination simulation
export const fetchLeads = async (options: {
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}) => {
  const { page = 1, pageSize = 10, sortColumn = 'created_at', sortDirection = 'desc', filters = {} } = options;
  console.log('Fetching leads with options:', options);
  
  const { data, error } = await apiClient.from('leads').select();

  if (error) {
      console.error("API Error fetching leads:", error);
      throw new Error('Failed to fetch leads');
  }
  if (!data) return { data: [], totalCount: 0 };

  const leadsData = data as MockLead[];

  let filteredData = leadsData.filter(lead => {
      for (const key in filters) {
          if (filters[key]) {
              if (key === 'status' && lead.status !== filters[key]) return false;
              if (key !== 'status' && !String(lead[key as keyof MockLead] ?? '').toLowerCase().includes(String(filters[key]).toLowerCase())) return false;
          }
      }
      return true;
  });

  filteredData.sort((a: MockLead, b: MockLead) => {
      const aValue = a[sortColumn as keyof MockLead];
      const bValue = b[sortColumn as keyof MockLead];
      let comparison = 0;
       if (sortColumn === 'created_at' && typeof aValue === 'string' && typeof bValue === 'string') { // Check types
            comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
       } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue, 'he');
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalCount = filteredData.length;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
  
  return { data: paginatedData, totalCount };
};

// Example: Fetch Customers
export const fetchCustomers = async (options: {
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}) => {
   const { page = 1, pageSize = 10, sortColumn = 'created_at', sortDirection = 'desc', filters = {} } = options;
   console.log('Fetching customers with options:', options);

   const { data, error } = await apiClient.from('customers').select();
   
   if (error) {
      console.error("API Error fetching customers:", error);
      throw new Error('Failed to fetch customers');
   }
   if (!data) return { data: [], totalCount: 0 };

   const customersData = data as MockCustomer[];

   let filteredData = customersData.filter(customer => {
     for (const key in filters) {
         if (filters[key]) {
            if (key === 'status' && customer.status !== filters[key]) return false;
            const customerKey = key === 'name' ? 'first_name' : key; 
            if (key !== 'status' && customerKey in customer && !String(customer[customerKey as keyof MockCustomer] ?? '').toLowerCase().includes(String(filters[key]).toLowerCase())) {
                return false;
            }
         }
     }
     return true;
   });

   filteredData.sort((a: MockCustomer, b: MockCustomer) => {
     const aValue = a[sortColumn as keyof MockCustomer];
     const bValue = b[sortColumn as keyof MockCustomer];
     let comparison = 0;
     if (sortColumn === 'created_at' && typeof aValue === 'string' && typeof bValue === 'string') { // Check types
         comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
     } else if (sortColumn === 'name') { 
         comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`, 'he');
     } else if (typeof aValue === 'string' && typeof bValue === 'string') {
         comparison = aValue.localeCompare(bValue, 'he');
     } else if (typeof aValue === 'number' && typeof bValue === 'number') {
         comparison = aValue - bValue;
     }
     return sortDirection === 'asc' ? comparison : -comparison;
   });

   const totalCount = filteredData.length;
   const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

   return { data: paginatedData, totalCount };
};

// Add other mock service functions (create, update, delete) as needed 