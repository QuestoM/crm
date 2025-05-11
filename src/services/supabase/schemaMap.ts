/**
 * Schema mapping to connect the application to the existing Supabase database
 * This file maps the application's expected field names to the actual database field names
 */

// Map for Lead object fields
export const leadFieldMap = {
  id: 'id',
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  phone: 'phone_number',
  source: 'lead_source',
  status: 'status',
  notes: 'custom_fields.notes',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  assignedTo: 'assigned_to',
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign'
};

// Map for Customer object fields
export const customerFieldMap = {
  id: 'id',
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  phone: 'phone_number',
  address: 'address',
  city: 'city',
  notes: 'custom_fields.notes',
  status: 'status',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  leadId: 'lead_id'
};

// Map for Product object fields
export const productFieldMap = {
  id: 'id',
  name: 'name',
  sku: 'sku',
  description: 'description',
  price: 'price',
  cost: 'cost',
  category: 'category',
  isActive: 'active',
  warrantyMonths: 'warranty_months',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Inventory related fields
  stock: 'inventory.quantity',
  minThreshold: 'inventory.min_threshold',
  lastRestock: 'inventory.last_restock'
};

// Map for Order object fields
export const orderFieldMap = {
  id: 'id',
  customerId: 'customer_id',
  status: 'status',
  subtotal: 'subtotal',
  discount: 'discount',
  tax: 'tax',
  total: 'total',
  paymentMethod: 'payment_method',
  paymentStatus: 'payment_status',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

// Map for OrderItem object fields
export const orderItemFieldMap = {
  id: 'id',
  orderId: 'order_id',
  productId: 'product_id',
  packageId: 'package_id',
  quantity: 'quantity',
  unitPrice: 'unit_price',
  totalPrice: 'total_price'
};

// Map for Technician object fields
export const technicianFieldMap = {
  id: 'id',
  firstName: 'first_name',
  lastName: 'last_name',
  email: 'email',
  phone: 'phone_number',
  status: 'status',
  skills: 'skills',
  workSchedule: 'work_schedule',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

// Map for ServiceAppointment object fields
export const appointmentFieldMap = {
  id: 'id',
  customerId: 'customer_id',
  technicianId: 'technician_id',
  productId: 'product_id',
  serviceType: 'service_type',
  status: 'status',
  scheduledAt: 'scheduled_at',
  completedAt: 'completed_at',
  notes: 'notes',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
};

/**
 * Maps application field name to database field name
 * @param entityType The type of entity (lead, customer, etc.)
 * @param field The application field name
 * @returns The database field name
 */
export function mapField(entityType: string, field: string): string {
  const maps: { [key: string]: Record<string, string> } = {
    lead: leadFieldMap,
    customer: customerFieldMap,
    product: productFieldMap,
    order: orderFieldMap,
    orderItem: orderItemFieldMap,
    technician: technicianFieldMap,
    appointment: appointmentFieldMap
  };

  const map = maps[entityType];
  if (!map) {
    console.warn(`No field map found for entity type: ${entityType}`);
    return field;
  }

  return map[field] || field;
} 