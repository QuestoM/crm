import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabase';
import { Document, DocumentFilter } from '../domain/types';
import { 
  DOCUMENT_PAGINATION_DEFAULT_LIMIT,
  DOCUMENT_PAGINATION_MAX_LIMIT 
} from '../domain/constants';

export async function findDocuments(
  filter: DocumentFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: Document[]; total: number }> {
  const {
    id,
    title,
    type,
    status,
    accessLevel,
    customerId,
    productId,
    orderId,
    invoiceId,
    leadId,
    appointmentId,
    tags,
    createdBy,
    createdAfter,
    createdBefore,
    isTemplate,
    searchQuery,
    limit = DOCUMENT_PAGINATION_DEFAULT_LIMIT,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filter;

  const limitValue = Math.min(limit, DOCUMENT_PAGINATION_MAX_LIMIT);

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' });

  // Apply filters
  if (id) query = query.eq('id', id);
  if (title) query = query.ilike('title', `%${title}%`);
  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);
  if (accessLevel) query = query.eq('accessLevel', accessLevel);
  if (customerId) query = query.eq('customerId', customerId);
  if (productId) query = query.eq('productId', productId);
  if (orderId) query = query.eq('orderId', orderId);
  if (invoiceId) query = query.eq('invoiceId', invoiceId);
  if (leadId) query = query.eq('leadId', leadId);
  if (appointmentId) query = query.eq('appointmentId', appointmentId);
  if (tags && tags.length > 0) query = query.contains('tags', tags);
  if (createdBy) query = query.eq('createdBy', createdBy);
  if (createdAfter) query = query.gte('createdAt', createdAfter.toISOString());
  if (createdBefore) query = query.lte('createdAt', createdBefore.toISOString());
  if (isTemplate !== undefined) query = query.eq('isTemplate', isTemplate);
  
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,fileName.ilike.%${searchQuery}%`);
  }

  // Apply pagination and sorting
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limitValue - 1);

  if (error) {
    throw new Error(`Failed to find documents: ${error.message}`);
  }

  return { 
    data: data as Document[], 
    total: count || 0 
  };
}

export async function findDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find document: ${error.message}`);
  }

  return data as Document;
}

export async function createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  const now = new Date();
  const newDocument = {
    ...document,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(newDocument)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create document: ${error.message}`);
  }

  return data as Document;
}

export async function updateDocument(
  id: string, 
  document: Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<Document> {
  const updatedDocument = {
    ...document,
    updatedAt: new Date(),
  };

  const { data, error } = await supabase
    .from('documents')
    .update(updatedDocument)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update document: ${error.message}`);
  }

  return data as Document;
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

export async function findDocumentsByEntityId(
  entityType: 'customer' | 'product' | 'order' | 'invoice' | 'lead' | 'appointment',
  entityId: string,
  limit: number = DOCUMENT_PAGINATION_DEFAULT_LIMIT
): Promise<Document[]> {
  const entityFieldMap = {
    customer: 'customerId',
    product: 'productId',
    order: 'orderId',
    invoice: 'invoiceId',
    lead: 'leadId',
    appointment: 'appointmentId'
  };

  const field = entityFieldMap[entityType];
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq(field, entityId)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to find documents for ${entityType}: ${error.message}`);
  }

  return data as Document[];
}

export async function findDocumentTemplates(
  type?: string,
  limit: number = DOCUMENT_PAGINATION_DEFAULT_LIMIT
): Promise<Document[]> {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('isTemplate', true);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query
    .order('title')
    .limit(limit);

  if (error) {
    throw new Error(`Failed to find document templates: ${error.message}`);
  }

  return data as Document[];
} 