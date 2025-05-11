-- Script to clean up existing data before inserting synthetic data
-- Delete in reverse order of dependencies

-- Delete notifications
DELETE FROM notifications;

-- Delete service appointments
DELETE FROM service_appointments;

-- Delete warranties
DELETE FROM warranties;

-- Delete invoices
DELETE FROM invoices;

-- Delete order items
DELETE FROM order_items;

-- Delete orders
DELETE FROM orders;

-- Delete inventory
DELETE FROM inventory;

-- Delete package items
DELETE FROM package_items;

-- Delete packages
DELETE FROM packages;

-- Delete customers
DELETE FROM customers;

-- Delete leads
DELETE FROM leads;

-- Delete technicians
DELETE FROM technicians;

-- Delete products
DELETE FROM products;

-- Delete users
DELETE FROM users;

-- Reset all sequences (if needed)
-- You can uncomment these if you want to reset the ID sequences
-- SELECT setval(pg_get_serial_sequence('table_name', 'id'), 1, false) FROM table_name; 