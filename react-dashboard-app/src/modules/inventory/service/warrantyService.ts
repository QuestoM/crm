import {
  findWarranties,
  findWarrantyById,
  findWarrantiesByCustomerId,
  findWarrantiesByProductId,
  findWarrantiesByOrderId,
  findExpiredWarranties,
  findWarrantiesExpiringInDays,
  createWarranty,
  updateWarranty,
  deleteWarranty,
  findWarrantyClaims,
  findWarrantyClaimById,
  findWarrantyClaimsByWarrantyId,
  createWarrantyClaim,
  updateWarrantyClaim,
  deleteWarrantyClaim
} from '../repository/warrantyRepository';
import { 
  Warranty, 
  WarrantyClaim, 
  WarrantyFilter, 
  WarrantyClaimFilter,
  WarrantyStatus 
} from '../domain/types';
import { 
  validateCreateWarranty, 
  validateUpdateWarranty,
  validateCreateWarrantyClaim,
  validateUpdateWarrantyClaim,
  validateWarrantyFilter,
  validateWarrantyClaimFilter 
} from '../domain/validation';
import { 
  WarrantyNotFoundError, 
  WarrantyClaimNotFoundError 
} from '../../../lib/errors';

// Warranty functions
export async function getWarranties(
  filter: WarrantyFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: Warranty[]; total: number }> {
  const validatedFilter = validateWarrantyFilter(filter);
  return findWarranties(validatedFilter);
}

export async function getWarrantyById(id: string): Promise<Warranty> {
  const warranty = await findWarrantyById(id);
  
  if (!warranty) {
    throw new WarrantyNotFoundError(id);
  }
  
  return warranty;
}

export async function getWarrantiesByCustomerId(customerId: string): Promise<Warranty[]> {
  return findWarrantiesByCustomerId(customerId);
}

export async function getWarrantiesByProductId(productId: string): Promise<Warranty[]> {
  return findWarrantiesByProductId(productId);
}

export async function getWarrantiesByOrderId(orderId: string): Promise<Warranty[]> {
  return findWarrantiesByOrderId(orderId);
}

export async function getExpiredWarranties(): Promise<Warranty[]> {
  return findExpiredWarranties();
}

export async function getWarrantiesExpiringInDays(days: number): Promise<Warranty[]> {
  return findWarrantiesExpiringInDays(days);
}

export async function addWarranty(data: unknown): Promise<Warranty> {
  const validatedData = validateCreateWarranty(data);
  return createWarranty(validatedData);
}

export async function modifyWarranty(id: string, data: unknown): Promise<Warranty> {
  const warranty = await findWarrantyById(id);
  
  if (!warranty) {
    throw new WarrantyNotFoundError(id);
  }
  
  const validatedData = validateUpdateWarranty(data);
  return updateWarranty(id, validatedData);
}

export async function removeWarranty(id: string): Promise<void> {
  const warranty = await findWarrantyById(id);
  
  if (!warranty) {
    throw new WarrantyNotFoundError(id);
  }
  
  return deleteWarranty(id);
}

export async function checkAndUpdateWarrantyStatus(id: string): Promise<Warranty> {
  const warranty = await findWarrantyById(id);
  
  if (!warranty) {
    throw new WarrantyNotFoundError(id);
  }
  
  const now = new Date();
  
  // If warranty is active but has expired, update the status
  if (warranty.status === WarrantyStatus.ACTIVE && new Date(warranty.endDate) < now) {
    return updateWarranty(id, { status: WarrantyStatus.EXPIRED });
  }
  
  return warranty;
}

// Warranty claim functions
export async function getWarrantyClaims(
  filter: WarrantyClaimFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: WarrantyClaim[]; total: number }> {
  const validatedFilter = validateWarrantyClaimFilter(filter);
  return findWarrantyClaims(validatedFilter);
}

export async function getWarrantyClaimById(id: string): Promise<WarrantyClaim> {
  const claim = await findWarrantyClaimById(id);
  
  if (!claim) {
    throw new WarrantyClaimNotFoundError(id);
  }
  
  return claim;
}

export async function getWarrantyClaimsByWarrantyId(warrantyId: string): Promise<WarrantyClaim[]> {
  // First check if warranty exists
  const warranty = await findWarrantyById(warrantyId);
  
  if (!warranty) {
    throw new WarrantyNotFoundError(warrantyId);
  }
  
  return findWarrantyClaimsByWarrantyId(warrantyId);
}

export async function addWarrantyClaim(data: unknown): Promise<WarrantyClaim> {
  const validatedData = validateCreateWarrantyClaim(data);
  
  // Check if the warranty exists and is active
  const warranty = await findWarrantyById(validatedData.warrantyId);
  
  if (!warranty) {
    throw new WarrantyNotFoundError(validatedData.warrantyId);
  }
  
  if (warranty.status !== WarrantyStatus.ACTIVE) {
    throw new Error(`Cannot create a claim for a warranty with status ${warranty.status}`);
  }
  
  return createWarrantyClaim(validatedData);
}

export async function modifyWarrantyClaim(id: string, data: unknown): Promise<WarrantyClaim> {
  const claim = await findWarrantyClaimById(id);
  
  if (!claim) {
    throw new WarrantyClaimNotFoundError(id);
  }
  
  const validatedData = validateUpdateWarrantyClaim(data);
  return updateWarrantyClaim(id, validatedData);
}

export async function removeWarrantyClaim(id: string): Promise<void> {
  const claim = await findWarrantyClaimById(id);
  
  if (!claim) {
    throw new WarrantyClaimNotFoundError(id);
  }
  
  return deleteWarrantyClaim(id);
} 