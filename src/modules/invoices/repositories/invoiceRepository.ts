import { supabaseClient } from '../../../services/supabase/client';
import { 
  CreateInvoiceInput, 
  Invoice, 
  InvoiceFilters, 
  InvoicePayment, 
  InvoiceStatus, 
  RecordPaymentInput, 
  UpdateInvoiceInput 
} from '../domain/types';
import { DEFAULT_INVOICE_STATUS, INVOICE_NUMBER_PREFIX } from '../domain/constants';

// Additional types for database responses
interface InvoiceWithRelations {
  [key: string]: any;
  order?: any;
  payments?: InvoicePayment[];
}

/**
 * Repository for invoice data operations
 */
export const invoiceRepository = {
  /**
   * Get all invoices with optional filtering and pagination
   */
  async getInvoices(
    filters?: InvoiceFilters,
    page: number = 1,
    pageSize: number = 20,
    includeOrder: boolean = false,
    includePayments: boolean = false
  ): Promise<{ invoices: Invoice[]; totalCount: number }> {
    try {
      // Build select query with optional relations
      let selectQuery = '*';
      if (includeOrder) {
        selectQuery += ', order:order_id(*)';
      }
      if (includePayments) {
        selectQuery += ', payments:invoice_payments(*)';
      }

      // Initial query builder
      let query = supabaseClient
        .from('invoices')
        .select(selectQuery, { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.order_id) {
          query = query.eq('order_id', filters.order_id);
        }

        if (filters.status) {
          if (Array.isArray(filters.status)) {
            query = query.in('status', filters.status);
          } else {
            query = query.eq('status', filters.status);
          }
        }

        if (filters.date_from) {
          query = query.gte('created_at', filters.date_from.toISOString());
        }

        if (filters.date_to) {
          query = query.lte('created_at', filters.date_to.toISOString());
        }

        if (filters.due_from) {
          query = query.gte('due_date', filters.due_from.toISOString());
        }

        if (filters.due_to) {
          query = query.lte('due_date', filters.due_to.toISOString());
        }

        if (filters.min_amount !== undefined) {
          query = query.gte('amount', filters.min_amount);
        }

        if (filters.max_amount !== undefined) {
          query = query.lte('amount', filters.max_amount);
        }

        // Search across invoice number or associated order
        if (filters.search) {
          query = query.or(`invoice_number.ilike.%${filters.search}%,order_id.ilike.%${filters.search}%`);
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

      // Process the returned data to format invoices with their relations
      const invoices = (data || []).map(invoice => {
        const invoiceData = invoice as InvoiceWithRelations;
        const result: Invoice = {
          id: invoiceData.id,
          order_id: invoiceData.order_id,
          invoice_number: invoiceData.invoice_number,
          status: invoiceData.status,
          amount: invoiceData.amount,
          due_date: new Date(invoiceData.due_date),
          created_at: new Date(invoiceData.created_at),
          paid_at: invoiceData.paid_at ? new Date(invoiceData.paid_at) : undefined
        };
        
        if (includeOrder && invoiceData.order) {
          result.order = invoiceData.order;
        }
        
        if (includePayments && invoiceData.payments) {
          result.payments = invoiceData.payments;
        }
        
        return result;
      });

      return {
        invoices,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  /**
   * Get a single invoice by ID with options to include related data
   */
  async getInvoiceById(
    id: string,
    includeOrder: boolean = false,
    includePayments: boolean = true
  ): Promise<Invoice | null> {
    try {
      // Build select query with optional relations
      let selectQuery = '*';
      
      if (includeOrder) {
        selectQuery += ', order:order_id(*)';
      }
      
      if (includePayments) {
        selectQuery += ', payments:invoice_payments(*)';
      }

      const { data, error } = await supabaseClient
        .from('invoices')
        .select(selectQuery)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      // Process the returned data to format invoice with its relations
      const invoiceData = data as InvoiceWithRelations;
      const invoice: Invoice = {
        id: invoiceData.id,
        order_id: invoiceData.order_id,
        invoice_number: invoiceData.invoice_number,
        status: invoiceData.status,
        amount: invoiceData.amount,
        due_date: new Date(invoiceData.due_date),
        created_at: new Date(invoiceData.created_at),
        paid_at: invoiceData.paid_at ? new Date(invoiceData.paid_at) : undefined
      };
      
      if (includeOrder && invoiceData.order) {
        invoice.order = invoiceData.order;
      }
      
      if (includePayments && invoiceData.payments) {
        invoice.payments = invoiceData.payments;
      }

      return invoice;
    } catch (error) {
      console.error(`Error fetching invoice with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(
    orderId: string,
    includePayments: boolean = true
  ): Promise<Invoice | null> {
    try {
      // Build select query with optional relations
      let selectQuery = '*';
      
      if (includePayments) {
        selectQuery += ', payments:invoice_payments(*)';
      }

      const { data, error } = await supabaseClient
        .from('invoices')
        .select(selectQuery)
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Process the returned data to format invoice with its relations
      const invoiceData = data as InvoiceWithRelations;
      const invoice: Invoice = {
        id: invoiceData.id,
        order_id: invoiceData.order_id,
        invoice_number: invoiceData.invoice_number,
        status: invoiceData.status,
        amount: invoiceData.amount,
        due_date: new Date(invoiceData.due_date),
        created_at: new Date(invoiceData.created_at),
        paid_at: invoiceData.paid_at ? new Date(invoiceData.paid_at) : undefined
      };
      
      if (includePayments && invoiceData.payments) {
        invoice.payments = invoiceData.payments;
      }

      return invoice;
    } catch (error) {
      console.error(`Error fetching invoice for order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Generate a unique invoice number
   */
  async generateInvoiceNumber(): Promise<string> {
    try {
      // Get the current year
      const currentYear = new Date().getFullYear();
      
      // Get the last invoice number for the current year
      const { data, error } = await supabaseClient
        .from('invoices')
        .select('invoice_number')
        .ilike('invoice_number', `${INVOICE_NUMBER_PREFIX}${currentYear}-%`)
        .order('invoice_number', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      let nextNumber = 1;
      if (data && data.length > 0) {
        // Parse the last number
        const lastInvoiceNumber = data[0].invoice_number;
        const parts = lastInvoiceNumber.split('-');
        if (parts.length === 3) {
          nextNumber = parseInt(parts[2], 10) + 1;
        }
      }
      
      // Format: INV-YYYY-0001
      return `${INVOICE_NUMBER_PREFIX}${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      throw error;
    }
  },

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: CreateInvoiceInput): Promise<Invoice> {
    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Get order amount if not provided
      let amount = invoiceData.amount;
      if (amount === undefined) {
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .select('total')
          .eq('id', invoiceData.order_id)
          .single();
        
        if (orderError) throw orderError;
        amount = order.total;
      }
      
      // Calculate due date if not provided
      const dueDate = invoiceData.due_date || this.calculateDueDate();
      
      // Create invoice
      const invoiceWithDefaults = {
        order_id: invoiceData.order_id,
        invoice_number: invoiceNumber,
        status: invoiceData.status || DEFAULT_INVOICE_STATUS,
        amount,
        due_date: dueDate instanceof Date ? dueDate.toISOString() : dueDate,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('invoices')
        .insert(invoiceWithDefaults)
        .select()
        .single();

      if (error) throw error;

      // Return the invoice
      return {
        ...data,
        due_date: new Date(data.due_date),
        created_at: new Date(data.created_at)
      } as Invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  /**
   * Update an existing invoice
   */
  async updateInvoice(invoiceData: UpdateInvoiceInput): Promise<Invoice> {
    try {
      const updates: any = { ...invoiceData };
      
      // Remove id from updates
      delete updates.id;
      
      // Format dates for database
      if (updates.due_date) {
        updates.due_date = updates.due_date instanceof Date 
          ? updates.due_date.toISOString() 
          : updates.due_date;
      }

      const { data, error } = await supabaseClient
        .from('invoices')
        .update(updates)
        .eq('id', invoiceData.id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        due_date: new Date(data.due_date),
        created_at: new Date(data.created_at),
        paid_at: data.paid_at ? new Date(data.paid_at) : undefined
      } as Invoice;
    } catch (error) {
      console.error(`Error updating invoice with ID ${invoiceData.id}:`, error);
      throw error;
    }
  },

  /**
   * Record a payment for an invoice
   */
  async recordPayment(paymentData: RecordPaymentInput): Promise<InvoicePayment> {
    try {
      // Get the invoice to check status and amount
      const invoice = await this.getInvoiceById(paymentData.invoice_id);
      
      if (!invoice) {
        throw new Error(`Invoice with ID ${paymentData.invoice_id} not found`);
      }
      
      // Create the payment
      const payment = {
        invoice_id: paymentData.invoice_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date 
          ? (paymentData.payment_date instanceof Date 
              ? paymentData.payment_date.toISOString() 
              : paymentData.payment_date) 
          : new Date().toISOString(),
        reference: paymentData.reference,
        notes: paymentData.notes,
        created_at: new Date().toISOString()
      };

      const { data: newPayment, error: paymentError } = await supabaseClient
        .from('invoice_payments')
        .insert(payment)
        .select()
        .single();

      if (paymentError) throw paymentError;
      
      // Get total payments for this invoice
      const { data: payments, error: paymentsError } = await supabaseClient
        .from('invoice_payments')
        .select('amount')
        .eq('invoice_id', paymentData.invoice_id);
      
      if (paymentsError) throw paymentsError;
      
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      
      // Update invoice status if fully paid
      if (totalPaid >= invoice.amount) {
        await this.updateInvoice({
          id: paymentData.invoice_id,
          status: InvoiceStatus.PAID,
          paid_at: new Date()
        });
      } else if (invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.OVERDUE) {
        // If it was draft or overdue, update to sent since we have a partial payment
        await this.updateInvoice({
          id: paymentData.invoice_id,
          status: InvoiceStatus.SENT
        });
      }

      return {
        ...newPayment,
        payment_date: new Date(newPayment.payment_date),
        created_at: new Date(newPayment.created_at)
      } as InvoicePayment;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  /**
   * Delete an invoice by ID
   */
  async deleteInvoice(id: string): Promise<boolean> {
    try {
      // First, delete all payments
      const { error: paymentsError } = await supabaseClient
        .from('invoice_payments')
        .delete()
        .eq('invoice_id', id);

      if (paymentsError) throw paymentsError;

      // Then delete the invoice
      const { error: invoiceError } = await supabaseClient
        .from('invoices')
        .delete()
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      return true;
    } catch (error) {
      console.error(`Error deleting invoice with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Calculate due date based on payment terms
   */
  calculateDueDate(): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days
    return dueDate;
  },

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<Invoice[]> {
    try {
      const today = new Date().toISOString();
      
      const { data, error } = await supabaseClient
        .from('invoices')
        .select('*')
        .lt('due_date', today)
        .not('status', 'eq', InvoiceStatus.PAID)
        .not('status', 'eq', InvoiceStatus.CANCELLED);
      
      if (error) throw error;
      
      return (data || []).map(invoice => ({
        ...invoice,
        due_date: new Date(invoice.due_date),
        created_at: new Date(invoice.created_at),
        paid_at: invoice.paid_at ? new Date(invoice.paid_at) : undefined
      })) as Invoice[];
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      throw error;
    }
  }
}; 