import {
  findInventoryItems,
  findInventoryItemById,
  findInventoryItemByProductId,
  findInventoryItemsBySku,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createInventoryTransaction,
  findInventoryTransactions,
  findLowStockItems
} from '../repository/inventoryRepository';
import { 
  InventoryItem, 
  InventoryTransaction, 
  InventoryItemFilter 
} from '../domain/types';
import { 
  validateCreateInventoryItem, 
  validateUpdateInventoryItem, 
  validateCreateInventoryTransaction,
  validateInventoryItemFilter 
} from '../domain/validation';
import { InventoryItemNotFoundError } from '../../../lib/errors';

export async function getInventoryItems(
  filter: InventoryItemFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: InventoryItem[]; total: number }> {
  const validatedFilter = validateInventoryItemFilter(filter);
  return findInventoryItems(validatedFilter);
}

export async function getInventoryItemById(id: string): Promise<InventoryItem> {
  const item = await findInventoryItemById(id);
  
  if (!item) {
    throw new InventoryItemNotFoundError(id);
  }
  
  return item;
}

export async function getInventoryItemByProductId(productId: string): Promise<InventoryItem | null> {
  return findInventoryItemByProductId(productId);
}

export async function getInventoryItemsBySku(sku: string): Promise<InventoryItem[]> {
  return findInventoryItemsBySku(sku);
}

export async function addInventoryItem(data: unknown): Promise<InventoryItem> {
  const validatedData = validateCreateInventoryItem(data);
  return createInventoryItem(validatedData);
}

export async function modifyInventoryItem(id: string, data: unknown): Promise<InventoryItem> {
  const item = await findInventoryItemById(id);
  
  if (!item) {
    throw new InventoryItemNotFoundError(id);
  }
  
  const validatedData = validateUpdateInventoryItem(data);
  return updateInventoryItem(id, validatedData);
}

export async function removeInventoryItem(id: string): Promise<void> {
  const item = await findInventoryItemById(id);
  
  if (!item) {
    throw new InventoryItemNotFoundError(id);
  }
  
  return deleteInventoryItem(id);
}

export async function recordInventoryTransaction(data: unknown): Promise<InventoryTransaction> {
  const validatedData = validateCreateInventoryTransaction(data);
  return createInventoryTransaction(validatedData);
}

export async function getInventoryTransactions(
  inventoryItemId: string,
  limit?: number,
  offset?: number
): Promise<InventoryTransaction[]> {
  const item = await findInventoryItemById(inventoryItemId);
  
  if (!item) {
    throw new InventoryItemNotFoundError(inventoryItemId);
  }
  
  return findInventoryTransactions(inventoryItemId, limit, offset);
}

export async function getLowStockItems(): Promise<InventoryItem[]> {
  return findLowStockItems();
}

export async function adjustInventoryQuantity(
  id: string, 
  quantity: number, 
  reason: string,
  userId: string
): Promise<InventoryItem> {
  const item = await findInventoryItemById(id);
  
  if (!item) {
    throw new InventoryItemNotFoundError(id);
  }
  
  // Record the transaction
  await createInventoryTransaction({
    inventoryItemId: id,
    type: 'ADJUSTMENT',
    quantity: quantity - item.quantity, // The adjustment amount
    notes: reason,
    createdBy: userId
  });
  
  // Update the inventory item
  return updateInventoryItem(id, { quantity });
} 