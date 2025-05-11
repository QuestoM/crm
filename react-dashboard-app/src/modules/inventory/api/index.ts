// Inventory API handlers
import getInventoryItemsHandler from './inventory/getInventoryItems';
import getInventoryItemByIdHandler from './inventory/getInventoryItemById';
import createInventoryItemHandler from './inventory/createInventoryItem';
import updateInventoryItemHandler from './inventory/updateInventoryItem';
import deleteInventoryItemHandler from './inventory/deleteInventoryItem';
import getLowStockItemsHandler from './inventory/getLowStockItems';
import getInventoryTransactionsHandler from './inventory/getInventoryTransactions';
import recordInventoryTransactionHandler from './inventory/recordInventoryTransaction';
import adjustInventoryQuantityHandler from './inventory/adjustInventoryQuantity';

// Warranty API handlers
import getWarrantiesHandler from './warranty/getWarranties';
import getWarrantyByIdHandler from './warranty/getWarrantyById';
import createWarrantyHandler from './warranty/createWarranty';
import updateWarrantyHandler from './warranty/updateWarranty';
import deleteWarrantyHandler from './warranty/deleteWarranty';
import getWarrantiesByEntityHandler from './warranty/getWarrantiesByEntity';
import getExpiredWarrantiesHandler from './warranty/getExpiredWarranties';
import getWarrantiesExpiringHandler from './warranty/getWarrantiesExpiring';
import checkWarrantyStatusHandler from './warranty/checkWarrantyStatus';

// Warranty claims API handlers
import getWarrantyClaimsHandler from './warranty/getWarrantyClaims';
import getWarrantyClaimByIdHandler from './warranty/getWarrantyClaimById';
import createWarrantyClaimHandler from './warranty/createWarrantyClaim';
import updateWarrantyClaimHandler from './warranty/updateWarrantyClaim';
import deleteWarrantyClaimHandler from './warranty/deleteWarrantyClaim';
import getWarrantyClaimsByWarrantyHandler from './warranty/getWarrantyClaimsByWarranty';

export {
  // Inventory exports
  getInventoryItemsHandler,
  getInventoryItemByIdHandler,
  createInventoryItemHandler,
  updateInventoryItemHandler,
  deleteInventoryItemHandler,
  getLowStockItemsHandler,
  getInventoryTransactionsHandler,
  recordInventoryTransactionHandler,
  adjustInventoryQuantityHandler,
  
  // Warranty exports
  getWarrantiesHandler,
  getWarrantyByIdHandler,
  createWarrantyHandler,
  updateWarrantyHandler,
  deleteWarrantyHandler,
  getWarrantiesByEntityHandler,
  getExpiredWarrantiesHandler,
  getWarrantiesExpiringHandler,
  checkWarrantyStatusHandler,
  
  // Warranty claims exports
  getWarrantyClaimsHandler,
  getWarrantyClaimByIdHandler,
  createWarrantyClaimHandler,
  updateWarrantyClaimHandler,
  deleteWarrantyClaimHandler,
  getWarrantyClaimsByWarrantyHandler
}; 