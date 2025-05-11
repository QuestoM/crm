// src/modules/orders/index.ts

// Domain exports
export * from './domain/types';
export * from './domain/constants';
export * from './domain/validation';

// Repository exports
export { orderRepository } from './repositories/orderRepository';

// Service exports
export { orderService, OrderValidationError } from './services/orderService';

// API handlers exports
export { default as getOrdersHandler } from './api/getOrders';
export { default as getOrderByIdHandler } from './api/getOrderById';
export { default as createOrderHandler } from './api/createOrder';
export { default as updateOrderHandler } from './api/updateOrder';
export { default as deleteOrderHandler } from './api/deleteOrder';
export { default as createOrderItemHandler } from './api/createOrderItem';
export { default as getOrderStatsHandler } from './api/getOrderStats'; 