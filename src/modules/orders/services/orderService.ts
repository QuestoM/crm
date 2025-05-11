import { orderRepository } from '../repositories/orderRepository';
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
  validateCreateOrder, 
  validateCreateOrderItem, 
  validateUpdateOrder, 
  validateUpdateOrderItem 
} from '../domain/validation';
import { createTask } from '../../../services/queue/queueService';
import { supabaseClient } from '../../../services/supabase/client';

/**
 * Error class for order validation errors
 */
export class OrderValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'OrderValidationError';
    this.errors = errors;
  }
}

/**
 * Service for order management operations
 */
export const orderService = {
  /**
   * Get orders with optional filtering and pagination
   */
  async getOrders(
    filters?: OrderFilters,
    page?: number,
    pageSize?: number,
    includeItems: boolean = false,
    includeCustomer: boolean = false
  ): Promise<{ orders: Order[]; totalCount: number }> {
    return orderRepository.getOrders(filters, page, pageSize, includeItems, includeCustomer);
  },

  /**
   * Get a single order by ID
   */
  async getOrderById(
    id: string,
    includeItems: boolean = true,
    includeCustomer: boolean = false,
    includeProductDetails: boolean = false
  ): Promise<Order | null> {
    return orderRepository.getOrderById(id, includeItems, includeCustomer, includeProductDetails);
  },

  /**
   * Create a new order with validation
   */
  async createOrder(orderData: CreateOrderInput): Promise<Order> {
    // Validate the order data
    const validation = validateCreateOrder(orderData);
    
    if (!validation.isValid) {
      throw new OrderValidationError('Order validation failed', validation.errors);
    }
    
    // Verify customer exists
    const { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('id')
      .eq('id', orderData.customer_id)
      .single();
    
    if (customerError) {
      throw new OrderValidationError('Order validation failed', {
        customer_id: 'לקוח לא קיים'
      });
    }
    
    // Verify products and packages exist
    for (const item of orderData.items) {
      if (item.product_id) {
        const { data: product, error: productError } = await supabaseClient
          .from('products')
          .select('id, active')
          .eq('id', item.product_id)
          .single();
        
        if (productError) {
          throw new OrderValidationError('Order validation failed', {
            [`items.${item.product_id}`]: 'מוצר לא קיים'
          });
        }
        
        if (!product.active) {
          throw new OrderValidationError('Order validation failed', {
            [`items.${item.product_id}`]: 'מוצר לא פעיל'
          });
        }
      }
      
      if (item.package_id) {
        const { data: packageItem, error: packageError } = await supabaseClient
          .from('packages')
          .select('id, active')
          .eq('id', item.package_id)
          .single();
        
        if (packageError) {
          throw new OrderValidationError('Order validation failed', {
            [`items.${item.package_id}`]: 'חבילה לא קיימת'
          });
        }
        
        if (!packageItem.active) {
          throw new OrderValidationError('Order validation failed', {
            [`items.${item.package_id}`]: 'חבילה לא פעילה'
          });
        }
      }
    }
    
    // Create the order in the database
    const order = await orderRepository.createOrder(orderData);
    
    // Queue notifications for new order
    try {
      await createTask('new_order_notification', {
        orderId: order.id,
        customerId: order.customer_id,
        notificationType: 'new_order'
      }, 5);
      
      // Queue inventory update task
      await createTask('update_inventory', {
        orderId: order.id,
        items: order.items?.map(item => ({
          productId: item.product_id,
          packageId: item.package_id,
          quantity: item.quantity
        }))
      }, 5);
    } catch (error) {
      console.error('Failed to queue order notifications:', error);
      // We don't want to fail the order creation if notification queueing fails
    }
    
    return order;
  },

  /**
   * Update an order with validation
   */
  async updateOrder(orderData: UpdateOrderInput): Promise<Order> {
    // Validate the order data
    const validation = validateUpdateOrder(orderData);
    
    if (!validation.isValid) {
      throw new OrderValidationError('Order validation failed', validation.errors);
    }
    
    // Check if the order exists
    const existingOrder = await orderRepository.getOrderById(orderData.id);
    
    if (!existingOrder) {
      throw new Error(`Order with ID ${orderData.id} not found`);
    }
    
    // Update the order in the database
    const updatedOrder = await orderRepository.updateOrder(orderData);
    
    // Queue notifications for status changes
    if (orderData.status && orderData.status !== existingOrder.status) {
      try {
        await createTask('order_status_changed', {
          orderId: updatedOrder.id,
          customerId: updatedOrder.customer_id,
          oldStatus: existingOrder.status,
          newStatus: updatedOrder.status
        }, 3);
      } catch (error) {
        console.error('Failed to queue order status notification:', error);
      }
    }
    
    // Queue notifications for payment status changes
    if (orderData.payment_status && orderData.payment_status !== existingOrder.payment_status) {
      try {
        await createTask('payment_status_changed', {
          orderId: updatedOrder.id,
          customerId: updatedOrder.customer_id,
          oldStatus: existingOrder.payment_status,
          newStatus: updatedOrder.payment_status
        }, 3);
      } catch (error) {
        console.error('Failed to queue payment status notification:', error);
      }
    }
    
    return updatedOrder;
  },

  /**
   * Delete an order by ID
   */
  async deleteOrder(id: string): Promise<boolean> {
    // Check if the order exists
    const existingOrder = await orderRepository.getOrderById(id);
    
    if (!existingOrder) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    // Check if the order can be deleted (e.g., not completed, no invoice)
    if (existingOrder.status === 'completed') {
      throw new Error('לא ניתן למחוק הזמנה שהושלמה');
    }
    
    // Check if order has invoices
    const { data: invoices } = await supabaseClient
      .from('invoices')
      .select('id')
      .eq('order_id', id)
      .limit(1);
    
    if (invoices && invoices.length > 0) {
      throw new Error('לא ניתן למחוק הזמנה עם חשבוניות קיימות');
    }
    
    // Delete the order and its items
    return orderRepository.deleteOrder(id);
  },

  /**
   * Add item to an order
   */
  async addOrderItem(itemData: CreateOrderItemInput): Promise<OrderItem> {
    // Validate the item data
    const validation = validateCreateOrderItem(itemData);
    
    if (!validation.isValid) {
      throw new OrderValidationError('Order item validation failed', validation.errors);
    }
    
    // Check if the order exists
    const existingOrder = await orderRepository.getOrderById(itemData.order_id);
    
    if (!existingOrder) {
      throw new Error(`Order with ID ${itemData.order_id} not found`);
    }
    
    // Verify product/package exists
    if (itemData.product_id) {
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('id, active')
        .eq('id', itemData.product_id)
        .single();
      
      if (productError) {
        throw new OrderValidationError('Order item validation failed', {
          product_id: 'מוצר לא קיים'
        });
      }
      
      if (!product.active) {
        throw new OrderValidationError('Order item validation failed', {
          product_id: 'מוצר לא פעיל'
        });
      }
    }
    
    if (itemData.package_id) {
      const { data: packageItem, error: packageError } = await supabaseClient
        .from('packages')
        .select('id, active')
        .eq('id', itemData.package_id)
        .single();
      
      if (packageError) {
        throw new OrderValidationError('Order item validation failed', {
          package_id: 'חבילה לא קיימת'
        });
      }
      
      if (!packageItem.active) {
        throw new OrderValidationError('Order item validation failed', {
          package_id: 'חבילה לא פעילה'
        });
      }
    }
    
    // Add the item to the order
    return orderRepository.createOrderItem(itemData);
  },

  /**
   * Update an order item
   */
  async updateOrderItem(itemData: UpdateOrderItemInput): Promise<OrderItem> {
    // Validate the item data
    const validation = validateUpdateOrderItem(itemData);
    
    if (!validation.isValid) {
      throw new OrderValidationError('Order item validation failed', validation.errors);
    }
    
    // Update the item
    return orderRepository.updateOrderItem(itemData);
  },

  /**
   * Remove an item from an order
   */
  async removeOrderItem(id: string): Promise<boolean> {
    return orderRepository.deleteOrderItem(id);
  },

  /**
   * Get order statistics
   */
  async getOrderStats(
    startDate?: Date, 
    endDate?: Date
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusCounts: Record<string, number>;
  }> {
    try {
      let query = supabaseClient
        .from('orders')
        .select('id, status, total', { count: 'exact' });
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const orders = data || [];
      const totalOrders = count || 0;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Count orders by status
      const statusCounts: Record<string, number> = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      
      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusCounts
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      throw error;
    }
  }
}; 