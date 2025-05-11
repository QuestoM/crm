// src/modules/products/index.ts

// Domain exports
export * from './domain/types';
export * from './domain/constants';
export * from './domain/validation';

// Repository exports
export { productRepository } from './repositories/productRepository';
export { packageRepository } from './repositories/packageRepository';

// Service exports
export { productService, ProductValidationError } from './services/productService';
export { packageService, PackageValidationError } from './services/packageService';

// API handlers exports for products
export { default as getProductsHandler } from './api/getProducts';
export { default as getProductByIdHandler } from './api/getProductById';
export { default as createProductHandler } from './api/createProduct';
export { default as updateProductHandler } from './api/updateProduct';
export { default as deleteProductHandler } from './api/deleteProduct';

// API handlers exports for packages
export { default as getPackagesHandler } from './api/getPackages';
export { default as getPackageByIdHandler } from './api/getPackageById';
export { default as createPackageHandler } from './api/createPackage';
export { default as updatePackageHandler } from './api/updatePackage';
export { default as deletePackageHandler } from './api/deletePackage';
 