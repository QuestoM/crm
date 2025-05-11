import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabase';
import { 
  Warranty, 
  WarrantyClaim, 
  WarrantyFilter,
  WarrantyClaimFilter,
  WarrantyStatus
} from '../domain/types';
import { 
  WARRANTY_PAGINATION_DEFAULT_LIMIT,
  WARRANTY_PAGINATION_MAX_LIMIT 
} from '../domain/constants';

export async function findWarranties(
  filter: WarrantyFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: Warranty[]; total: number }> {
  const {
    id,
    customerId,
    productId,
    orderId,
    serialNumber,
    status,
    expiringBefore,
    expiringAfter,
    startedBefore,
    startedAfter,
    limit = WARRANTY_PAGINATION_DEFAULT_LIMIT,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filter;

  const limitValue = Math.min(limit, WARRANTY_PAGINATION_MAX_LIMIT);

  let query = supabase
    .from('warranties')
    .select('*', { count: 'exact' });

  // Apply filters
  if (id) query = query.eq('id', id);
  if (customerId) query = query.eq('customerId', customerId);
  if (productId) query = query.eq('productId', productId);
  if (orderId) query = query.eq('orderId', orderId);
  if (serialNumber) query = query.ilike('serialNumber', `%${serialNumber}%`);
  if (status) query = query.eq('status', status);
  if (expiringBefore) query = query.lte('endDate', expiringBefore.toISOString());
  if (expiringAfter) query = query.gte('endDate', expiringAfter.toISOString());
  if (startedBefore) query = query.lte('startDate', startedBefore.toISOString());
  if (startedAfter) query = query.gte('startDate', startedAfter.toISOString());

  // Apply pagination and sorting
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limitValue - 1);

  if (error) {
    throw new Error(`Failed to find warranties: ${error.message}`);
  }

  return { 
    data: data as Warranty[], 
    total: count || 0 
  };
}

export async function findWarrantyById(id: string): Promise<Warranty | null> {
  const { data, error } = await supabase
    .from('warranties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find warranty: ${error.message}`);
  }

  return data as Warranty;
}

export async function findWarrantiesByCustomerId(customerId: string): Promise<Warranty[]> {
  const { data, error } = await supabase
    .from('warranties')
    .select('*')
    .eq('customerId', customerId)
    .order('endDate', { ascending: true });

  if (error) {
    throw new Error(`Failed to find warranties for customer: ${error.message}`);
  }

  return data as Warranty[];
}

export async function findWarrantiesByProductId(productId: string): Promise<Warranty[]> {
  const { data, error } = await supabase
    .from('warranties')
    .select('*')
    .eq('productId', productId)
    .order('endDate', { ascending: true });

  if (error) {
    throw new Error(`Failed to find warranties for product: ${error.message}`);
  }

  return data as Warranty[];
}

export async function findWarrantiesByOrderId(orderId: string): Promise<Warranty[]> {
  const { data, error } = await supabase
    .from('warranties')
    .select('*')
    .eq('orderId', orderId)
    .order('endDate', { ascending: true });

  if (error) {
    throw new Error(`Failed to find warranties for order: ${error.message}`);
  }

  return data as Warranty[];
}

export async function findExpiredWarranties(): Promise<Warranty[]> {
  const now = new Date();
  
  const { data, error } = await supabase
    .from('warranties')
    .select('*')
    .eq('status', WarrantyStatus.ACTIVE)
    .lt('endDate', now.toISOString())
    .order('endDate');

  if (error) {
    throw new Error(`Failed to find expired warranties: ${error.message}`);
  }

  return data as Warranty[];
}

export async function findWarrantiesExpiringInDays(days: number): Promise<Warranty[]> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  const { data, error } = await supabase
    .from('warranties')
    .select('*')
    .eq('status', WarrantyStatus.ACTIVE)
    .gte('endDate', now.toISOString())
    .lte('endDate', future.toISOString())
    .order('endDate');

  if (error) {
    throw new Error(`Failed to find warranties expiring soon: ${error.message}`);
  }

  return data as Warranty[];
}

export async function createWarranty(
  warranty: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Warranty> {
  const now = new Date();
  const newWarranty = {
    ...warranty,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from('warranties')
    .insert(newWarranty)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create warranty: ${error.message}`);
  }

  return data as Warranty;
}

export async function updateWarranty(
  id: string, 
  warranty: Partial<Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Warranty> {
  const updatedWarranty = {
    ...warranty,
    updatedAt: new Date(),
  };

  const { data, error } = await supabase
    .from('warranties')
    .update(updatedWarranty)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update warranty: ${error.message}`);
  }

  return data as Warranty;
}

export async function deleteWarranty(id: string): Promise<void> {
  const { error } = await supabase
    .from('warranties')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete warranty: ${error.message}`);
  }
}

export async function findWarrantyClaims(
  filter: WarrantyClaimFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: WarrantyClaim[]; total: number }> {
  const {
    id,
    warrantyId,
    customerId,
    productId,
    status,
    submittedBefore,
    submittedAfter,
    assignedTo,
    limit = WARRANTY_PAGINATION_DEFAULT_LIMIT,
    offset = 0,
    sortBy = 'dateSubmitted',
    sortOrder = 'desc'
  } = filter;

  const limitValue = Math.min(limit, WARRANTY_PAGINATION_MAX_LIMIT);

  let query = supabase
    .from('warranty_claims')
    .select('*', { count: 'exact' });

  // Apply filters
  if (id) query = query.eq('id', id);
  if (warrantyId) query = query.eq('warrantyId', warrantyId);
  if (customerId) query = query.eq('customerId', customerId);
  if (productId) query = query.eq('productId', productId);
  if (status) query = query.eq('status', status);
  if (submittedBefore) query = query.lte('dateSubmitted', submittedBefore.toISOString());
  if (submittedAfter) query = query.gte('dateSubmitted', submittedAfter.toISOString());
  if (assignedTo) query = query.eq('assignedTo', assignedTo);

  // Apply pagination and sorting
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limitValue - 1);

  if (error) {
    throw new Error(`Failed to find warranty claims: ${error.message}`);
  }

  return { 
    data: data as WarrantyClaim[], 
    total: count || 0 
  };
}

export async function findWarrantyClaimById(id: string): Promise<WarrantyClaim | null> {
  const { data, error } = await supabase
    .from('warranty_claims')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find warranty claim: ${error.message}`);
  }

  return data as WarrantyClaim;
}

export async function findWarrantyClaimsByWarrantyId(warrantyId: string): Promise<WarrantyClaim[]> {
  const { data, error } = await supabase
    .from('warranty_claims')
    .select('*')
    .eq('warrantyId', warrantyId)
    .order('dateSubmitted', { ascending: false });

  if (error) {
    throw new Error(`Failed to find warranty claims for warranty: ${error.message}`);
  }

  return data as WarrantyClaim[];
}

export async function createWarrantyClaim(
  claim: Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WarrantyClaim> {
  const now = new Date();
  const newClaim = {
    ...claim,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from('warranty_claims')
    .insert(newClaim)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create warranty claim: ${error.message}`);
  }

  return data as WarrantyClaim;
}

export async function updateWarrantyClaim(
  id: string, 
  claim: Partial<Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<WarrantyClaim> {
  const updatedClaim = {
    ...claim,
    updatedAt: new Date(),
  };

  const { data, error } = await supabase
    .from('warranty_claims')
    .update(updatedClaim)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update warranty claim: ${error.message}`);
  }

  return data as WarrantyClaim;
}

export async function deleteWarrantyClaim(id: string): Promise<void> {
  const { error } = await supabase
    .from('warranty_claims')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete warranty claim: ${error.message}`);
  }
} 