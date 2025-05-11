import { productRepository } from '../repositories/productRepository';
import { CreateProductInput, Product, ProductFilters, UpdateProductInput } from '../domain/types';
import { validateCreateProduct, validateUpdateProduct } from '../domain/validation';
import { createTask } from '../../../services/queue/queueService';
import { supabaseClient } from '../../../services/supabase/client';

/**
 * Error class for product validation errors
 */
export class ProductValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'ProductValidationError';
    this.errors = errors;
  }
}

/**
 * Service for product management operations
 */
export const productService = {
  /**
   * Get products with optional filtering and pagination
   */
  async getProducts(
    filters?: ProductFilters,
    page?: number,
    pageSize?: number
  ): Promise<{ products: Product[]; totalCount: number }> {
    return productRepository.getProducts(filters, page, pageSize);
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    return productRepository.getProductById(id);
  },

  /**
   * Create a new product with validation
   */
  async createProduct(productData: CreateProductInput): Promise<Product> {
    // Validate the product data
    const validation = validateCreateProduct(productData);
    
    if (!validation.isValid) {
      throw new ProductValidationError('Product validation failed', validation.errors);
    }
    
    // Check if the SKU is unique
    const isSkuUnique = await productRepository.isSkuUnique(productData.sku);
    
    if (!isSkuUnique) {
      throw new ProductValidationError('Product validation failed', {
        sku: 'מק"ט זה כבר קיים במערכת'
      });
    }
    
    // Create the product in the database
    const product = await productRepository.createProduct(productData);
    
    // Queue notifications for new product
    try {
      await createTask('new_product_notification', {
        productId: product.id,
        notificationType: 'new_product'
      }, 3);
    } catch (error) {
      console.error('Failed to queue product notification:', error);
      // We don't want to fail the product creation if notification queueing fails
    }
    
    return product;
  },

  /**
   * Update a product with validation
   */
  async updateProduct(productData: UpdateProductInput): Promise<Product> {
    // Validate the product data
    const validation = validateUpdateProduct(productData);
    
    if (!validation.isValid) {
      throw new ProductValidationError('Product validation failed', validation.errors);
    }
    
    // Check if the product exists
    const existingProduct = await productRepository.getProductById(productData.id);
    
    if (!existingProduct) {
      throw new Error(`Product with ID ${productData.id} not found`);
    }
    
    // If SKU is being changed, check if it's unique
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const isSkuUnique = await productRepository.isSkuUnique(productData.sku, productData.id);
      
      if (!isSkuUnique) {
        throw new ProductValidationError('Product validation failed', {
          sku: 'מק"ט זה כבר קיים במערכת'
        });
      }
    }
    
    // Update the product in the database
    const updatedProduct = await productRepository.updateProduct(productData);
    
    // Queue inventory checking task if active status changed
    if (productData.active !== undefined && productData.active !== existingProduct.active) {
      try {
        await createTask('product_status_changed', {
          productId: updatedProduct.id,
          oldStatus: existingProduct.active,
          newStatus: productData.active
        }, 3);
      } catch (error) {
        console.error('Failed to queue product status change notification:', error);
      }
    }
    
    return updatedProduct;
  },

  /**
   * Delete a product by ID
   */
  async deleteProduct(id: string): Promise<boolean> {
    // Check if the product exists
    const existingProduct = await productRepository.getProductById(id);
    
    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    // Check if product is used in any package
    const { data: packageItems } = await supabaseClient
      .from('package_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (packageItems && packageItems.length > 0) {
      throw new Error('המוצר נמצא בשימוש בחבילות ולא ניתן למחיקה');
    }
    
    // Check if product is used in any orders
    const { data: orderItems } = await supabaseClient
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (orderItems && orderItems.length > 0) {
      throw new Error('המוצר נמצא בשימוש בהזמנות ולא ניתן למחיקה');
    }
    
    // Check if product has warranties
    const { data: warranties } = await supabaseClient
      .from('warranties')
      .select('id')
      .eq('product_id', id)
      .limit(1);
    
    if (warranties && warranties.length > 0) {
      throw new Error('למוצר יש אחריות פעילה ולא ניתן למחיקה');
    }
    
    // If product passes all checks, it can be deleted
    return productRepository.deleteProduct(id);
  },

  /**
   * Check if a product SKU is unique
   */
  async isSkuUnique(sku: string, excludeProductId?: string): Promise<boolean> {
    return productRepository.isSkuUnique(sku, excludeProductId);
  }
}; 