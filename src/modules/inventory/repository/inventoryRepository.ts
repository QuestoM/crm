import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabase';
import { 
  InventoryItem, 
  InventoryTransaction, 
  InventoryItemFilter,
  InventoryItemStatus
} from '../domain/types';
import { 
  INVENTORY_PAGINATION_DEFAULT_LIMIT,
  INVENTORY_PAGINATION_MAX_LIMIT 
} from '../domain/constants';

export async function findInventoryItems(
  filter: InventoryItemFilter & { 
    limit?: number; 
    offset?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc'; 
  }
): Promise<{ data: InventoryItem[]; total: number }> {
  const {
    id,
    productId,
    sku,
    name,
    status,
    tags,
    supplier,
    location,
    lowStock,
    searchQuery,
    limit = INVENTORY_PAGINATION_DEFAULT_LIMIT,
    offset = 0,
    sortBy = 'name',
    sortOrder = 'asc'
  } = filter;

  const limitValue = Math.min(limit, INVENTORY_PAGINATION_MAX_LIMIT);

  let query = supabase
    .from('inventory_items')
    .select('*', { count: 'exact' });

  // Apply filters
  if (id) query = query.eq('id', id);
  if (productId) query = query.eq('productId', productId);
  if (sku) query = query.ilike('sku', `%${sku}%`);
  if (name) query = query.ilike('name', `%${name}%`);
  if (status) query = query.eq('status', status);
  if (tags && tags.length > 0) query = query.contains('tags', tags);
  if (supplier) query = query.ilike('supplier', `%${supplier}%`);
  if (location) query = query.ilike('location', `%${location}%`);
  
  if (lowStock) {
    query = query.or('quantity.lte.reorderPoint,status.eq.LOW_STOCK,status.eq.OUT_OF_STOCK');
  }
  
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  // Apply pagination and sorting
  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limitValue - 1);

  if (error) {
    throw new Error(`Failed to find inventory items: ${error.message}`);
  }

  return { 
    data: data as InventoryItem[], 
    total: count || 0 
  };
}

export async function findInventoryItemById(id: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find inventory item: ${error.message}`);
  }

  return data as InventoryItem;
}

export async function findInventoryItemByProductId(productId: string): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('productId', productId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find inventory item for product: ${error.message}`);
  }

  return data as InventoryItem;
}

export async function findInventoryItemsBySku(sku: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .ilike('sku', `%${sku}%`);

  if (error) {
    throw new Error(`Failed to find inventory items by SKU: ${error.message}`);
  }

  return data as InventoryItem[];
}

export async function createInventoryItem(
  item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<InventoryItem> {
  const now = new Date();
  const newItem = {
    ...item,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from('inventory_items')
    .insert(newItem)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create inventory item: ${error.message}`);
  }

  return data as InventoryItem;
}

export async function updateInventoryItem(
  id: string, 
  item: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<InventoryItem> {
  const updatedItem = {
    ...item,
    updatedAt: new Date(),
  };

  // Check if quantity is updated and update status accordingly
  if (item.quantity !== undefined) {
    const existingItem = await findInventoryItemById(id);
    if (existingItem) {
      if (item.quantity === 0) {
        updatedItem.status = InventoryItemStatus.OUT_OF_STOCK;
      } else if (item.quantity <= existingItem.reorderPoint) {
        updatedItem.status = InventoryItemStatus.LOW_STOCK;
      } else if (existingItem.status !== InventoryItemStatus.DISCONTINUED && 
                existingItem.status !== InventoryItemStatus.ON_ORDER) {
        updatedItem.status = InventoryItemStatus.IN_STOCK;
      }
    }
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .update(updatedItem)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update inventory item: ${error.message}`);
  }

  return data as InventoryItem;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete inventory item: ${error.message}`);
  }
}

export async function createInventoryTransaction(
  transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>
): Promise<InventoryTransaction> {
  // First check if inventory item exists
  const inventoryItem = await findInventoryItemById(transaction.inventoryItemId);
  if (!inventoryItem) {
    throw new Error('Inventory item not found');
  }
  
  // Create transaction with UUID
  const now = new Date();
  const newTransaction = {
    ...transaction,
    id: uuidv4(),
    createdAt: now,
    totalCost: transaction.unitCost ? transaction.quantity * transaction.unitCost : undefined
  };

  // Start a transaction to ensure both the transaction is recorded and inventory is updated
  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert(newTransaction)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create inventory transaction: ${error.message}`);
  }

  // Update inventory quantity based on transaction type
  let quantityChange = 0;
  switch (transaction.type) {
    case 'PURCHASE':
      quantityChange = Math.abs(transaction.quantity);
      break;
    case 'SALE':
      quantityChange = -Math.abs(transaction.quantity);
      break;
    case 'RETURN':
      quantityChange = Math.abs(transaction.quantity);
      break;
    case 'ADJUSTMENT':
      quantityChange = transaction.quantity; // Can be positive or negative
      break;
    case 'TRANSFER':
      // For transfers, we'd usually handle both source and destination
      // but for simplicity, we're just handling one side here
      quantityChange = -Math.abs(transaction.quantity);
      break;
    default:
      break;
  }

  // Update the inventory item's quantity
  const newQuantity = Math.max(0, inventoryItem.quantity + quantityChange);
  await updateInventoryItem(inventoryItem.id, { 
    quantity: newQuantity,
    lastOrderDate: transaction.type === 'PURCHASE' ? now : inventoryItem.lastOrderDate
  });

  return data as InventoryTransaction;
}

export async function findInventoryTransactions(
  inventoryItemId: string,
  limit: number = 20,
  offset: number = 0
): Promise<InventoryTransaction[]> {
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('*')
    .eq('inventoryItemId', inventoryItemId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to find inventory transactions: ${error.message}`);
  }

  return data as InventoryTransaction[];
}

export async function findLowStockItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .or('quantity.lte.reorderPoint,status.eq.LOW_STOCK,status.eq.OUT_OF_STOCK')
    .order('name');

  if (error) {
    throw new Error(`Failed to find low stock items: ${error.message}`);
  }

  return data as InventoryItem[];
} 