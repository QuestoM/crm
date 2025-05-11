import { supabase } from '../supabase/client';
import { ServiceResponse } from './supabaseService';

/**
 * Dashboard summary data
 */
export interface DashboardSummary {
  customers: {
    total: number;
    percentChange: number;
  };
  orders: {
    total: number;
    percentChange: number;
  };
  tasks: {
    total: number;
    highPriority: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    status: string;
    amount: number;
    date: string;
  }>;
}

interface OrderWithCustomer {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  customer_id: string;
  customers?: {
    id: string;
    first_name: string;
    last_name: string;
  }
}

/**
 * Get dashboard summary data
 */
export async function getDashboardSummary(): Promise<ServiceResponse<DashboardSummary>> {
  try {
    // Run parallel queries for efficiency
    const [
      customersResult,
      ordersResult,
      tasksResult,
      recentOrdersResult
    ] = await Promise.all([
      // Get customer count
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      
      // Get order count
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      
      // Get task count and high priority tasks
      supabase.from('tasks')
        .select('*', { count: 'exact' })
        .eq('priority', 'high'),
      
      // Get recent orders with customer data
      supabase.from('orders')
        .select(`
          id, 
          amount, 
          status, 
          created_at,
          customer_id,
          customers:customer_id(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    // Calculate percentage changes (mocked for now)
    const customerPercentChange = 12; // Would be calculated from historical data
    const orderPercentChange = 5; // Would be calculated from historical data

    // Format recent orders
    const recentOrders = (recentOrdersResult.data || []).map((order: OrderWithCustomer) => ({
      id: order.id,
      customer: order.customers ? `${order.customers.first_name} ${order.customers.last_name}` : 'Unknown',
      status: order.status,
      amount: order.amount,
      date: new Date(order.created_at).toLocaleDateString('he-IL')
    }));

    // If any query failed, return error
    if (customersResult.error || ordersResult.error || 
        tasksResult.error || recentOrdersResult.error) {
      return {
        success: false,
        error: {
          code: 'data_fetch_error',
          message: customersResult.error?.message || 
                   ordersResult.error?.message || 
                   tasksResult.error?.message || 
                   recentOrdersResult.error?.message || 
                   'Failed to fetch dashboard data'
        }
      };
    }

    return {
      success: true,
      data: {
        customers: {
          total: customersResult.count || 0,
          percentChange: customerPercentChange
        },
        orders: {
          total: ordersResult.count || 0,
          percentChange: orderPercentChange
        },
        tasks: {
          total: tasksResult.count || 0,
          highPriority: (tasksResult.data || []).length
        },
        recentOrders
      }
    };
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    return {
      success: false,
      error: {
        code: 'dashboard_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
} 