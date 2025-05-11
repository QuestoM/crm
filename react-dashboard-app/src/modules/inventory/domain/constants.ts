import { InventoryItemStatus, WarrantyStatus, WarrantyClaimStatus } from './types';

export const INVENTORY_ITEM_STATUSES = Object.values(InventoryItemStatus);
export const WARRANTY_STATUSES = Object.values(WarrantyStatus);
export const WARRANTY_CLAIM_STATUSES = Object.values(WarrantyClaimStatus);

export const DEFAULT_INVENTORY_ITEM_STATUS = InventoryItemStatus.IN_STOCK;
export const DEFAULT_WARRANTY_STATUS = WarrantyStatus.ACTIVE;
export const DEFAULT_WARRANTY_CLAIM_STATUS = WarrantyClaimStatus.SUBMITTED;

export const DEFAULT_MIN_QUANTITY = 0;
export const DEFAULT_REORDER_POINT = 5;
export const DEFAULT_REORDER_QUANTITY = 10;

export const INVENTORY_PAGINATION_DEFAULT_LIMIT = 20;
export const INVENTORY_PAGINATION_MAX_LIMIT = 100;

export const WARRANTY_PAGINATION_DEFAULT_LIMIT = 20;
export const WARRANTY_PAGINATION_MAX_LIMIT = 100;

export const TRANSACTION_TYPES = [
  'PURCHASE',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
  'TRANSFER'
];

export const WARRANTY_TYPES = [
  'STANDARD',
  'EXTENDED',
  'LIMITED',
  'LIFETIME',
  'MANUFACTURER',
  'CUSTOM'
]; 