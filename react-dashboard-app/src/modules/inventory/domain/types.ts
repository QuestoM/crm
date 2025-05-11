export enum InventoryItemStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
  ON_ORDER = 'ON_ORDER',
}

export enum WarrantyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  VOID = 'VOID',
  PENDING = 'PENDING',
}

export enum WarrantyClaimStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  location?: string;
  status: InventoryItemStatus;
  tags?: string[];
  supplier?: string;
  supplierCode?: string;
  lastOrderDate?: Date;
  nextOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  type: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reference?: string;
  orderId?: string;
  invoiceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Warranty {
  id: string;
  customerId: string;
  productId: string;
  orderId: string;
  orderItemId?: string;
  serialNumber?: string;
  startDate: Date;
  endDate: Date;
  duration: number; // In months
  status: WarrantyStatus;
  type: string;
  terms?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  customerId: string;
  productId: string;
  dateSubmitted: Date;
  issueDescription: string;
  status: WarrantyClaimStatus;
  resolution?: string;
  resolutionDate?: Date;
  attachments?: string[];
  notes?: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemFilter {
  id?: string;
  productId?: string;
  sku?: string;
  name?: string;
  status?: InventoryItemStatus;
  tags?: string[];
  supplier?: string;
  location?: string;
  lowStock?: boolean;
  searchQuery?: string;
}

export interface WarrantyFilter {
  id?: string;
  customerId?: string;
  productId?: string;
  orderId?: string;
  serialNumber?: string;
  status?: WarrantyStatus;
  expiringBefore?: Date;
  expiringAfter?: Date;
  startedBefore?: Date;
  startedAfter?: Date;
}

export interface WarrantyClaimFilter {
  id?: string;
  warrantyId?: string;
  customerId?: string;
  productId?: string;
  status?: WarrantyClaimStatus;
  submittedBefore?: Date;
  submittedAfter?: Date;
  assignedTo?: string;
} 