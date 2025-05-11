import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../shared/api/types';
import { Invoice, InvoiceFilters, InvoiceStatus } from '../domain/types';
import { invoiceService } from '../services/invoiceService';

/**
 * API handler for getting invoices with filtering and pagination
 */
export default async function getInvoicesHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ invoices: Invoice[], totalCount: number }>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'method_not_allowed',
        message: 'Only GET requests are allowed',
      },
    });
  }
  
  try {
    // Extract query parameters
    const { 
      page, 
      pageSize, 
      order_id, 
      status, 
      date_from, 
      date_to, 
      due_from, 
      due_to, 
      min_amount, 
      max_amount, 
      search,
      include_order,
      include_payments
    } = req.query;
    
    // Convert query params to proper types
    const filters: InvoiceFilters = {};
    
    if (order_id) {
      filters.order_id = String(order_id);
    }
    
    if (status) {
      if (Array.isArray(status)) {
        filters.status = status.map(s => s as InvoiceStatus);
      } else {
        filters.status = status as InvoiceStatus;
      }
    }
    
    if (date_from) {
      filters.date_from = new Date(String(date_from));
    }
    
    if (date_to) {
      filters.date_to = new Date(String(date_to));
    }
    
    if (due_from) {
      filters.due_from = new Date(String(due_from));
    }
    
    if (due_to) {
      filters.due_to = new Date(String(due_to));
    }
    
    if (min_amount) {
      filters.min_amount = Number(min_amount);
    }
    
    if (max_amount) {
      filters.max_amount = Number(max_amount);
    }
    
    if (search) {
      filters.search = String(search);
    }
    
    // Convert pagination params
    const pageNumber = page ? parseInt(String(page), 10) : 1;
    const itemsPerPage = pageSize ? parseInt(String(pageSize), 10) : 20;
    
    // Convert boolean params
    const includeOrder = include_order === 'true';
    const includePayments = include_payments === 'true';
    
    // Get invoices with filters and pagination
    const result = await invoiceService.getInvoices(
      filters,
      pageNumber,
      itemsPerPage,
      includeOrder,
      includePayments
    );
    
    // Return response
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error('Error in getInvoices API:', error);
    
    // Handle other errors
    return res.status(500).json({
      error: {
        code: 'server_error',
        message: 'An error occurred while fetching invoices',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
    });
  }
} 