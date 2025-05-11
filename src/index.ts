import { initEnvironment } from './services/config/environment';

// Initialize the application
export const initApp = () => {
  // Initialize environment variables
  initEnvironment();
  
  // Add other initialization here if needed
};

// Export all modules with namespace imports to avoid naming conflicts
import * as leadsModule from './modules/leads';
import * as customersModule from './modules/customers';
import * as productsModule from './modules/products';
import * as ordersModule from './modules/orders';
import * as invoicesModule from './modules/invoices';
import * as appointmentsModule from './modules/appointments';
import * as notificationsModule from './modules/notifications';
import * as documentsModule from './modules/documents';
import * as analyticsModule from './modules/analytics';
import * as inventoryModule from './modules/inventory';
import * as tasksModule from './modules/tasks';

export { 
  leadsModule,
  customersModule,
  productsModule,
  ordersModule,
  invoicesModule,
  appointmentsModule,
  notificationsModule,
  documentsModule,
  analyticsModule,
  inventoryModule,
  tasksModule
};

// Export shared services and types
export * from './services/queue/queueService';
export * from './shared/api/types';

// Auto-initialize if this is the main module
if (require.main === module) {
  initApp();
} 