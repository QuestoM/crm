import { z } from 'zod';
import { 
  InventoryItemStatus, 
  WarrantyStatus, 
  WarrantyClaimStatus,
  InventoryItem,
  InventoryTransaction,
  Warranty,
  WarrantyClaim,
  InventoryItemFilter,
  WarrantyFilter,
  WarrantyClaimFilter
} from './types';
import { 
  DEFAULT_MIN_QUANTITY,
  DEFAULT_REORDER_POINT,
  DEFAULT_REORDER_QUANTITY,
  TRANSACTION_TYPES,
  WARRANTY_TYPES
} from './constants';

export const inventoryItemSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  quantity: z.number().int().nonnegative(),
  minQuantity: z.number().int().nonnegative().default(DEFAULT_MIN_QUANTITY),
  maxQuantity: z.number().int().positive().optional(),
  reorderPoint: z.number().int().nonnegative().default(DEFAULT_REORDER_POINT),
  reorderQuantity: z.number().int().positive().default(DEFAULT_REORDER_QUANTITY),
  unitCost: z.number().nonnegative(),
  location: z.string().max(255).optional(),
  status: z.nativeEnum(InventoryItemStatus),
  tags: z.array(z.string()).optional(),
  supplier: z.string().max(255).optional(),
  supplierCode: z.string().max(100).optional(),
  lastOrderDate: z.date().optional(),
  nextOrderDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const inventoryTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  inventoryItemId: z.string().uuid(),
  type: z.enum(TRANSACTION_TYPES as [string, ...string[]]),
  quantity: z.number().int().nonzero(),
  unitCost: z.number().nonnegative().optional(),
  totalCost: z.number().optional(),
  reference: z.string().max(255).optional(),
  orderId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date().optional(),
});

export const warrantySchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  orderItemId: z.string().uuid().optional(),
  serialNumber: z.string().max(100).optional(),
  startDate: z.date(),
  endDate: z.date(),
  duration: z.number().int().positive(),
  status: z.nativeEnum(WarrantyStatus),
  type: z.enum(WARRANTY_TYPES as [string, ...string[]]),
  terms: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
  attachments: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).refine(
  (data) => {
    return data.endDate > data.startDate;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const warrantyClaimSchema = z.object({
  id: z.string().uuid().optional(),
  warrantyId: z.string().uuid(),
  customerId: z.string().uuid(),
  productId: z.string().uuid(),
  dateSubmitted: z.date(),
  issueDescription: z.string().min(1).max(2000),
  status: z.nativeEnum(WarrantyClaimStatus),
  resolution: z.string().max(2000).optional(),
  resolutionDate: z.date().optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const inventoryItemFilterSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  sku: z.string().optional(),
  name: z.string().optional(),
  status: z.nativeEnum(InventoryItemStatus).optional(),
  tags: z.array(z.string()).optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  lowStock: z.boolean().optional(),
  searchQuery: z.string().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const warrantyFilterSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  serialNumber: z.string().optional(),
  status: z.nativeEnum(WarrantyStatus).optional(),
  expiringBefore: z.date().optional(),
  expiringAfter: z.date().optional(),
  startedBefore: z.date().optional(),
  startedAfter: z.date().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const warrantyClaimFilterSchema = z.object({
  id: z.string().uuid().optional(),
  warrantyId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  status: z.nativeEnum(WarrantyClaimStatus).optional(),
  submittedBefore: z.date().optional(),
  submittedAfter: z.date().optional(),
  assignedTo: z.string().uuid().optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createInventoryItemSchema = inventoryItemSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateInventoryItemSchema = inventoryItemSchema
  .partial()
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true 
  });

export const createInventoryTransactionSchema = inventoryTransactionSchema.omit({ 
  id: true, 
  createdAt: true 
});

export const createWarrantySchema = warrantySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateWarrantySchema = warrantySchema
  .partial()
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true 
  });

export const createWarrantyClaimSchema = warrantyClaimSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateWarrantyClaimSchema = warrantyClaimSchema
  .partial()
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true 
  });

export function validateInventoryItem(data: unknown): InventoryItem {
  return inventoryItemSchema.parse(data) as InventoryItem;
}

export function validateCreateInventoryItem(data: unknown): Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> {
  return createInventoryItemSchema.parse(data);
}

export function validateUpdateInventoryItem(data: unknown): Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>> {
  return updateInventoryItemSchema.parse(data);
}

export function validateInventoryTransaction(data: unknown): InventoryTransaction {
  return inventoryTransactionSchema.parse(data) as InventoryTransaction;
}

export function validateCreateInventoryTransaction(data: unknown): Omit<InventoryTransaction, 'id' | 'createdAt'> {
  return createInventoryTransactionSchema.parse(data);
}

export function validateWarranty(data: unknown): Warranty {
  return warrantySchema.parse(data) as Warranty;
}

export function validateCreateWarranty(data: unknown): Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'> {
  return createWarrantySchema.parse(data);
}

export function validateUpdateWarranty(data: unknown): Partial<Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>> {
  return updateWarrantySchema.parse(data);
}

export function validateWarrantyClaim(data: unknown): WarrantyClaim {
  return warrantyClaimSchema.parse(data) as WarrantyClaim;
}

export function validateCreateWarrantyClaim(data: unknown): Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt'> {
  return createWarrantyClaimSchema.parse(data);
}

export function validateUpdateWarrantyClaim(data: unknown): Partial<Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt'>> {
  return updateWarrantyClaimSchema.parse(data);
}

export function validateInventoryItemFilter(data: unknown): InventoryItemFilter {
  return inventoryItemFilterSchema.parse(data);
}

export function validateWarrantyFilter(data: unknown): WarrantyFilter {
  return warrantyFilterSchema.parse(data);
}

export function validateWarrantyClaimFilter(data: unknown): WarrantyClaimFilter {
  return warrantyClaimFilterSchema.parse(data);
} 