import { invoiceRepository } from '../repositories/invoiceRepository';
import { 
  CreateInvoiceInput, 
  Invoice, 
  InvoiceFilters, 
  InvoicePayment, 
  InvoiceStatus, 
  RecordPaymentInput, 
  UpdateInvoiceInput 
} from '../domain/types';
import { validateCreateInvoice, validateRecordPayment, validateUpdateInvoice } from '../domain/validation';
import { createTask } from '../../../services/queue/queueService';
import { supabaseClient } from '../../../services/supabase/client';
import { DEFAULT_PAYMENT_TERMS_DAYS } from '../domain/constants';

/**
 * Error class for invoice validation errors
 */
export class InvoiceValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'InvoiceValidationError';
    this.errors = errors;
  }
}

/**
 * Service for invoice management operations
 */
export const invoiceService = {
  /**
   * Get invoices with optional filtering and pagination
   */
  async getInvoices(
    filters?: InvoiceFilters,
    page?: number,
    pageSize?: number,
    includeOrder: boolean = false,
    includePayments: boolean = false
  ): Promise<{ invoices: Invoice[]; totalCount: number }> {
    return invoiceRepository.getInvoices(filters, page, pageSize, includeOrder, includePayments);
  },

  /**
   * Get a single invoice by ID
   */
  async getInvoiceById(
    id: string,
    includeOrder: boolean = false,
    includePayments: boolean = true
  ): Promise<Invoice | null> {
    return invoiceRepository.getInvoiceById(id, includeOrder, includePayments);
  },

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(
    orderId: string,
    includePayments: boolean = true
  ): Promise<Invoice | null> {
    return invoiceRepository.getInvoiceByOrderId(orderId, includePayments);
  },

  /**
   * Create a new invoice with validation
   */
  async createInvoice(invoiceData: CreateInvoiceInput): Promise<Invoice> {
    // Validate the invoice data
    const validation = validateCreateInvoice(invoiceData);
    
    if (!validation.isValid) {
      throw new InvoiceValidationError('Invoice validation failed', validation.errors);
    }
    
    // Verify order exists
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, status, total')
      .eq('id', invoiceData.order_id)
      .single();
    
    if (orderError) {
      throw new InvoiceValidationError('Invoice validation failed', {
        order_id: 'הזמנה לא קיימת'
      });
    }
    
    // Check if invoice already exists for this order
    const existingInvoice = await invoiceRepository.getInvoiceByOrderId(invoiceData.order_id);
    
    if (existingInvoice) {
      throw new InvoiceValidationError('Invoice validation failed', {
        order_id: 'חשבונית כבר קיימת להזמנה זו'
      });
    }
    
    // Calculate due date if not provided
    if (!invoiceData.due_date) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + DEFAULT_PAYMENT_TERMS_DAYS);
      invoiceData.due_date = dueDate;
    }
    
    // Use order total if amount not provided
    if (invoiceData.amount === undefined) {
      invoiceData.amount = order.total;
    }
    
    // Create the invoice
    const invoice = await invoiceRepository.createInvoice(invoiceData);
    
    // Queue notifications for new invoice
    try {
      // Get customer ID from order
      const { data: orderWithCustomer } = await supabaseClient
        .from('orders')
        .select('customer_id')
        .eq('id', invoice.order_id)
        .single();
      
      if (orderWithCustomer && orderWithCustomer.customer_id) {
        await createTask('new_invoice_notification', {
          invoiceId: invoice.id,
          orderId: invoice.order_id,
          customerId: orderWithCustomer.customer_id,
          notificationType: 'new_invoice'
        }, 5);
      }
    } catch (error) {
      console.error('Failed to queue invoice notifications:', error);
      // We don't fail the invoice creation if notification queueing fails
    }
    
    return invoice;
  },

  /**
   * Update an invoice with validation
   */
  async updateInvoice(invoiceData: UpdateInvoiceInput): Promise<Invoice> {
    // Validate the invoice data
    const validation = validateUpdateInvoice(invoiceData);
    
    if (!validation.isValid) {
      throw new InvoiceValidationError('Invoice validation failed', validation.errors);
    }
    
    // Check if the invoice exists
    const existingInvoice = await invoiceRepository.getInvoiceById(invoiceData.id);
    
    if (!existingInvoice) {
      throw new Error(`Invoice with ID ${invoiceData.id} not found`);
    }
    
    // Prevent changes to paid invoices unless setting to another status
    if (existingInvoice.status === InvoiceStatus.PAID && 
        (!invoiceData.status || invoiceData.status === InvoiceStatus.PAID)) {
      
      if (invoiceData.amount || invoiceData.due_date) {
        throw new InvoiceValidationError('Invoice validation failed', {
          status: 'לא ניתן לשנות חשבונית ששולמה'
        });
      }
    }
    
    // Set paid_at date if status is changed to PAID
    if (invoiceData.status === InvoiceStatus.PAID && existingInvoice.status !== InvoiceStatus.PAID) {
      invoiceData.paid_at = new Date();
    }
    
    // Update the invoice
    const invoice = await invoiceRepository.updateInvoice(invoiceData);
    
    // Queue notifications for status changes
    if (invoiceData.status && invoiceData.status !== existingInvoice.status) {
      try {
        // Get customer ID from order
        const { data: order } = await supabaseClient
          .from('orders')
          .select('customer_id')
          .eq('id', invoice.order_id)
          .single();
        
        if (order && order.customer_id) {
          await createTask('invoice_status_changed', {
            invoiceId: invoice.id,
            orderId: invoice.order_id,
            customerId: order.customer_id,
            oldStatus: existingInvoice.status,
            newStatus: invoice.status
          }, 3);
        }
        
        // Also update order payment status if invoice is paid
        if (invoice.status === InvoiceStatus.PAID) {
          await supabaseClient
            .from('orders')
            .update({ payment_status: 'paid' })
            .eq('id', invoice.order_id);
        }
      } catch (error) {
        console.error('Failed to queue invoice status notification:', error);
      }
    }
    
    return invoice;
  },

  /**
   * Delete an invoice by ID with validation
   */
  async deleteInvoice(id: string): Promise<boolean> {
    // Check if the invoice exists
    const existingInvoice = await invoiceRepository.getInvoiceById(id, false, true);
    
    if (!existingInvoice) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    
    // Prevent deletion of paid invoices
    if (existingInvoice.status === InvoiceStatus.PAID) {
      throw new Error('לא ניתן למחוק חשבונית ששולמה');
    }
    
    // Check if invoice has payments
    if (existingInvoice.payments && existingInvoice.payments.length > 0) {
      throw new Error('לא ניתן למחוק חשבונית עם תשלומים');
    }
    
    // Delete the invoice
    return invoiceRepository.deleteInvoice(id);
  },

  /**
   * Record a payment for an invoice with validation
   */
  async recordPayment(paymentData: RecordPaymentInput): Promise<InvoicePayment> {
    // Validate the payment data
    const validation = validateRecordPayment(paymentData);
    
    if (!validation.isValid) {
      throw new InvoiceValidationError('Payment validation failed', validation.errors);
    }
    
    // Check if the invoice exists
    const invoice = await invoiceRepository.getInvoiceById(paymentData.invoice_id, false, true);
    
    if (!invoice) {
      throw new Error(`Invoice with ID ${paymentData.invoice_id} not found`);
    }
    
    // Check if invoice is already paid in full
    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('חשבונית זו כבר שולמה במלואה');
    }
    
    // Check if invoice is cancelled
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error('לא ניתן לרשום תשלום לחשבונית מבוטלת');
    }
    
    // Calculate total paid so far
    const totalPaidSoFar = invoice.payments ? 
      invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
    
    // Check if payment would exceed invoice amount
    if (totalPaidSoFar + paymentData.amount > invoice.amount) {
      throw new Error('סכום התשלום חורג מהסכום שנותר לתשלום בחשבונית');
    }
    
    // Record the payment
    const payment = await invoiceRepository.recordPayment(paymentData);
    
    // Queue notification for payment
    try {
      // Get customer ID from order
      const { data: order } = await supabaseClient
        .from('orders')
        .select('customer_id')
        .eq('id', invoice.order_id)
        .single();
      
      if (order && order.customer_id) {
        await createTask('payment_recorded', {
          invoiceId: invoice.id,
          orderId: invoice.order_id,
          customerId: order.customer_id,
          paymentId: payment.id,
          amount: payment.amount
        }, 3);
      }
    } catch (error) {
      console.error('Failed to queue payment notification:', error);
    }
    
    return payment;
  },

  /**
   * Get invoices that are overdue and update their status
   */
  async processOverdueInvoices(): Promise<number> {
    try {
      // Get all overdue invoices
      const overdueInvoices = await invoiceRepository.getOverdueInvoices();
      
      // Update status to OVERDUE for each invoice
      let updatedCount = 0;
      
      for (const invoice of overdueInvoices) {
        if (invoice.status !== InvoiceStatus.OVERDUE) {
          await invoiceRepository.updateInvoice({
            id: invoice.id,
            status: InvoiceStatus.OVERDUE
          });
          
          // Queue notification for overdue invoice
          try {
            // Get customer ID from order
            const { data: order } = await supabaseClient
              .from('orders')
              .select('customer_id')
              .eq('id', invoice.order_id)
              .single();
            
            if (order && order.customer_id) {
              await createTask('invoice_overdue_notification', {
                invoiceId: invoice.id,
                orderId: invoice.order_id,
                customerId: order.customer_id,
                daysOverdue: Math.floor((new Date().getTime() - invoice.due_date.getTime()) / (1000 * 60 * 60 * 24))
              }, 3);
            }
          } catch (error) {
            console.error('Failed to queue overdue notification:', error);
          }
          
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      console.error('Error processing overdue invoices:', error);
      throw error;
    }
  },

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(
    startDate?: Date, 
    endDate?: Date
  ): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    statusCounts: Record<string, number>;
  }> {
    try {
      let query = supabaseClient
        .from('invoices')
        .select('id, status, amount', { count: 'exact' });
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const invoices = data || [];
      const totalInvoices = count || 0;
      const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      
      // Sum up paid and unpaid amounts
      let paidAmount = 0;
      let unpaidAmount = 0;
      invoices.forEach(invoice => {
        if (invoice.status === InvoiceStatus.PAID) {
          paidAmount += invoice.amount;
        } else if (invoice.status !== InvoiceStatus.CANCELLED) {
          unpaidAmount += invoice.amount;
        }
      });
      
      // Count invoices by status
      const statusCounts: Record<string, number> = {};
      invoices.forEach(invoice => {
        statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1;
      });
      
      return {
        totalInvoices,
        totalAmount,
        paidAmount,
        unpaidAmount,
        statusCounts
      };
    } catch (error) {
      console.error('Error getting invoice statistics:', error);
      throw error;
    }
  }
}; 