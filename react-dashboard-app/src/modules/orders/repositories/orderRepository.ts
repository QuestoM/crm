import { supabaseClient } from '../../../services/supabase/client';
import { 
  CreateOrderInput, 
  CreateOrderItemInput, 
  Order, 
  OrderFilters, 
  OrderItem, 
  UpdateOrderInput, 
  UpdateOrderItemInput 
} from '../domain/types';
import { 
  DEFAULT_ORDER_STATUS, 
  DEFAULT_PAYMENT_METHOD, 
  DEFAULT_PAYMENT_STATUS, 
  DEFAULT_TAX_RATE 
} from '../domain/constants';

// Additional types for database responses
interface OrderWithRelations {
  [key: string]: any;
  order_items?: OrderItem[];
  customer?: any;
}

/**
 * Repository for order data operations
 */
export const orderRepository = {
  /**
   * Get all orders with optional filtering and pagination
   */
  async getOrders(
    filters?: OrderFilters,
    page: number = 1,
    pageSize: number = 20,
    includeItems: boolean = false,
    includeCustomer: boolean = false
  ): Promise<{ orders: Order[]; totalCount: number }> {
    try {
      // Build select query with optional relations
      let selectQuery = '*';
      if (includeItems) {
        selectQuery += ', order_items(*)';
      }
      if (includeCustomer) {
        selectQuery += ', customer:customer_id(*)';
      }

      // Initial query builder
      let query = supabaseClient
        .from('orders')
        .select(selectQuery, { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.customer_id) {
          query = query.eq('customer_id', filters.customer_id);
        }

        if (filters.status) {
          if (Array.isArray(filters.status)) {
            query = query.in('status', filters.status);
          } else {
            query = query.eq('status', filters.status);
          }
        }

        if (filters.payment_status) {
          if (Array.isArray(filters.payment_status)) {
            query = query.in('payment_status', filters.payment_status);
          } else {
            query = query.eq('payment_status', filters.payment_status);
          }
        }

        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from.toISOString());
        }

        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to.toISOString());
        }

        if (filters.min_total !== undefined) {
          query = query.gte('total', filters.min_total);
        }

        if (filters.max_total !== undefined) {
          query = query.lte('total', filters.max_total);
        }

        // Search is complex and depends on joined data, so we'll handle it last
        if (filters.search) {
          // Basic search on order ID or amount
          query = query.or(`id.ilike.%${filters.search}%,customer_id.ilike.%${filters.search}%`);
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Process the returned data to format orders with their relations
      const orders = (data || []).map(order => {
        const orderData = order as OrderWithRelations;
        const result: Order = {
          id: orderData.id,
          customer_id: orderData.customer_id,
          status: orderData.status,
          subtotal: orderData.subtotal,
          discount: orderData.discount,
          tax: orderData.tax,
          total: orderData.total,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          created_at: new Date(orderData.created_at),
          updated_at: new Date(orderData.updated_at)
        };
        
        if (includeItems && orderData.order_items) {
          result.items = orderData.order_items;
        }
        
        if (includeCustomer && orderData.customer) {
          result.customer = orderData.customer;
        }
        
        return result;
      });

      return {
        orders,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Get a single order by ID with options to include related data
   */
  async getOrderById(
    id: string,
    includeItems: boolean = true,
    includeCustomer: boolean = false,
    includeProductDetails: boolean = false
  ): Promise<Order | null> {
    try {
      // Build select query with optional relations
      let selectQuery = '*';
      
      if (includeItems) {
        if (includeProductDetails) {
          selectQuery += ', order_items(*, product:product_id(*), package:package_id(*))';
        } else {
          selectQuery += ', order_items(*)';
        }
      }
      
      if (includeCustomer) {
        selectQuery += ', customer:customer_id(*)';
      }

      const { data, error } = await supabaseClient
        .from('orders')
        .select(selectQuery)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      // Process the returned data to format order with its relations
      const orderData = data as OrderWithRelations;
      const order: Order = {
        id: orderData.id,
        customer_id: orderData.customer_id,
        status: orderData.status,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        tax: orderData.tax,
        total: orderData.total,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status,
        created_at: new Date(orderData.created_at),
        updated_at: new Date(orderData.updated_at)
      };
      
      if (includeItems && orderData.order_items) {
        order.items = orderData.order_items;
      }
      
      if (includeCustomer && orderData.customer) {
        order.customer = orderData.customer;
      }

      return order;
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order with its items
   */
  async createOrder(orderData: CreateOrderInput): Promise<Order> {
    // We need a transaction to create the order and its items
    try {
      // Begin transaction
      const { data: client } = await supabaseClient.rpc('begin_transaction');

      // Calculate order totals
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price),
        0
      );
      
      const discount = orderData.discount || 0;
      const tax = orderData.tax !== undefined ? orderData.tax : (subtotal - discount) * DEFAULT_TAX_RATE;
      const total = subtotal - discount + tax;

      // Create order
      const orderWithDefaults = {
        customer_id: orderData.customer_id,
        status: orderData.status || DEFAULT_ORDER_STATUS,
        subtotal,
        discount,
        tax,
        total,
        payment_method: orderData.payment_method || DEFAULT_PAYMENT_METHOD,
        payment_status: orderData.payment_status || DEFAULT_PAYMENT_STATUS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newOrder, error: orderError } = await supabaseClient
        .from('orders')
        .insert(orderWithDefaults)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        package_id: item.package_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { data: items, error: itemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      // Return the complete order with items
      return {
        ...newOrder,
        items: items as OrderItem[]
      } as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      // Roll back the transaction if supported
      try {
        await supabaseClient.rpc('rollback_transaction');
      } catch {}
      throw error;
    }
  },

  /**
   * Update an existing order
   */
  async updateOrder(orderData: UpdateOrderInput): Promise<Order> {
    try {
      const updates = {
        ...orderData,
        updated_at: new Date().toISOString()
      };

      // Remove id from updates object
      delete updates.id;

      const { data, error } = await supabaseClient
        .from('orders')
        .update(updates)
        .eq('id', orderData.id)
        .select()
        .single();

      if (error) throw error;

      return data as Order;
    } catch (error) {
      console.error(`Error updating order with ID ${orderData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an order by ID (with all its items)
   */
  async deleteOrder(id: string): Promise<boolean> {
    try {
      // First, delete all order items
      const { error: itemsError } = await supabaseClient
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabaseClient
        .from('orders')
        .delete()
        .eq('id', id);

      if (orderError) throw orderError;

      return true;
    } catch (error) {
      console.error(`Error deleting order with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order item
   */
  async createOrderItem(itemData: CreateOrderItemInput): Promise<OrderItem> {
    try {
      const item = {
        ...itemData,
        total_price: itemData.quantity * itemData.unit_price
      };

      const { data, error } = await supabaseClient
        .from('order_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      // Update order totals
      await this.recalculateOrderTotals(itemData.order_id);

      return data as OrderItem;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  },

  /**
   * Update an existing order item
   */
  async updateOrderItem(itemData: UpdateOrderItemInput): Promise<OrderItem> {
    try {
      // First, get the existing item to determine the orderId and calculate total_price
      const { data: existingItem, error: fetchError } = await supabaseClient
        .from('order_items')
        .select('order_id, unit_price, quantity')
        .eq('id', itemData.id)
        .single();
      
      if (fetchError) throw fetchError;

      const updates: any = { ...itemData };
      delete updates.id; // Remove ID from updates

      // Calculate new total price if necessary
      if (itemData.quantity !== undefined || itemData.unit_price !== undefined) {
        const newQuantity = itemData.quantity !== undefined ? itemData.quantity : existingItem.quantity;
        const newUnitPrice = itemData.unit_price !== undefined ? itemData.unit_price : existingItem.unit_price;
        updates.total_price = newQuantity * newUnitPrice;
      }

      const { data, error } = await supabaseClient
        .from('order_items')
        .update(updates)
        .eq('id', itemData.id)
        .select()
        .single();

      if (error) throw error;

      // Update order totals
      await this.recalculateOrderTotals(existingItem.order_id);

      return data as OrderItem;
    } catch (error) {
      console.error(`Error updating order item with ID ${itemData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an order item by ID
   */
  async deleteOrderItem(id: string): Promise<boolean> {
    try {
      // First get the order ID
      const { data: item, error: fetchError } = await supabaseClient
        .from('order_items')
        .select('order_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabaseClient
        .from('order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update order totals
      await this.recalculateOrderTotals(item.order_id);

      return true;
    } catch (error) {
      console.error(`Error deleting order item with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Recalculate and update order totals
   */
  async recalculateOrderTotals(orderId: string): Promise<void> {
    try {
      // Get all items for the order
      const { data: items, error: itemsError } = await supabaseClient
        .from('order_items')
        .select('quantity, unit_price, total_price')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Get the order to retrieve discount and tax info
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .select('discount, tax')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Calculate new subtotal
      const subtotal = (items || []).reduce(
        (sum, item) => sum + item.total_price,
        0
      );

      // Preserve existing discount
      const discount = order.discount || 0;

      // Recalculate tax if needed, or preserve existing
      // Here we're assuming if tax was manually set, we preserve it,
      // otherwise we recalculate based on the tax rate
      const taxableAmount = subtotal - discount;
      const tax = order.tax || (taxableAmount * DEFAULT_TAX_RATE);

      // Calculate total
      const total = subtotal - discount + tax;

      // Update the order
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          subtotal,
          total,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error(`Error recalculating order totals for order ${orderId}:`, error);
      throw error;
    }
  }
}; 