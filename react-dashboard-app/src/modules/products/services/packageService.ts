import { packageRepository } from '../repositories/packageRepository';
import { productRepository } from '../repositories/productRepository';
import { 
  CreatePackageInput, 
  Package, 
  PackageFilters, 
  UpdatePackageInput 
} from '../domain/types';
import { validateCreatePackage, validateUpdatePackage } from '../domain/validation';
import { createTask } from '../../../services/queue/queueService';
import { supabaseClient } from '../../../services/supabase/client';

/**
 * Error class for package validation errors
 */
export class PackageValidationError extends Error {
  errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string>) {
    super(message);
    this.name = 'PackageValidationError';
    this.errors = errors;
  }
}

/**
 * Service for package management operations
 */
export const packageService = {
  /**
   * Get packages with optional filtering and pagination
   */
  async getPackages(
    filters?: PackageFilters,
    page?: number,
    pageSize?: number
  ): Promise<{ packages: Package[]; totalCount: number }> {
    return packageRepository.getPackages(filters, page, pageSize);
  },

  /**
   * Get a single package by ID
   */
  async getPackageById(id: string): Promise<Package | null> {
    return packageRepository.getPackageById(id);
  },

  /**
   * Create a new package with validation
   */
  async createPackage(packageData: CreatePackageInput): Promise<Package> {
    // Validate the package data
    const validation = validateCreatePackage(packageData);
    
    if (!validation.isValid) {
      throw new PackageValidationError('Package validation failed', validation.errors);
    }
    
    // Verify all products exist
    for (const item of packageData.items) {
      const product = await productRepository.getProductById(item.product_id);
      
      if (!product) {
        throw new PackageValidationError('Package validation failed', {
          [`items.${item.product_id}`]: 'מוצר לא קיים'
        });
      }
      
      if (!product.active) {
        throw new PackageValidationError('Package validation failed', {
          [`items.${item.product_id}`]: 'מוצר לא פעיל'
        });
      }
    }
    
    // Create the package in the database
    const packageItem = await packageRepository.createPackage(packageData);
    
    // Queue notifications for new package
    try {
      await createTask('new_package_notification', {
        packageId: packageItem.id,
        notificationType: 'new_package'
      }, 3);
    } catch (error) {
      console.error('Failed to queue package notification:', error);
      // We don't want to fail the package creation if notification queueing fails
    }
    
    return packageItem;
  },

  /**
   * Update a package with validation
   */
  async updatePackage(packageData: UpdatePackageInput): Promise<Package> {
    // Validate the package data
    const validation = validateUpdatePackage(packageData);
    
    if (!validation.isValid) {
      throw new PackageValidationError('Package validation failed', validation.errors);
    }
    
    // Check if the package exists
    const existingPackage = await packageRepository.getPackageById(packageData.id);
    
    if (!existingPackage) {
      throw new Error(`Package with ID ${packageData.id} not found`);
    }
    
    // Verify all products exist if items are provided
    if (packageData.items) {
      for (const item of packageData.items) {
        const product = await productRepository.getProductById(item.product_id);
        
        if (!product) {
          throw new PackageValidationError('Package validation failed', {
            [`items.${item.product_id}`]: 'מוצר לא קיים'
          });
        }
        
        if (!product.active) {
          throw new PackageValidationError('Package validation failed', {
            [`items.${item.product_id}`]: 'מוצר לא פעיל'
          });
        }
      }
    }
    
    // Update the package in the database
    const updatedPackage = await packageRepository.updatePackage(packageData);
    
    // Queue notification if active status changed
    if (packageData.active !== undefined && packageData.active !== existingPackage.active) {
      try {
        await createTask('package_status_changed', {
          packageId: updatedPackage.id,
          oldStatus: existingPackage.active,
          newStatus: packageData.active
        }, 3);
      } catch (error) {
        console.error('Failed to queue package status change notification:', error);
      }
    }
    
    return updatedPackage;
  },

  /**
   * Delete a package by ID
   */
  async deletePackage(id: string): Promise<boolean> {
    // Check if the package exists
    const existingPackage = await packageRepository.getPackageById(id);
    
    if (!existingPackage) {
      throw new Error(`Package with ID ${id} not found`);
    }
    
    // Check if package is used in any orders
    const { data: orderItems } = await supabaseClient
      .from('order_items')
      .select('id')
      .eq('package_id', id)
      .limit(1);
    
    if (orderItems && orderItems.length > 0) {
      throw new Error('החבילה נמצאת בשימוש בהזמנות ולא ניתן למחיקה');
    }
    
    // If package passes all checks, it can be deleted
    return packageRepository.deletePackage(id);
  },

  /**
   * Calculate the total price of a package
   */
  async calculatePackagePrice(packageId: string): Promise<number> {
    const packageItem = await packageRepository.getPackageById(packageId);
    
    if (!packageItem) {
      throw new Error(`Package with ID ${packageId} not found`);
    }
    
    let totalPrice = packageItem.base_price || 0;
    
    // Calculate price from items
    if (packageItem.items && packageItem.items.length > 0) {
      for (const item of packageItem.items) {
        // If item has a price override, use that
        if (item.price_override !== undefined && item.price_override !== null) {
          totalPrice += item.price_override * item.quantity;
        } 
        // Otherwise, get the product price
        else if (item.product) {
          totalPrice += item.product.price * item.quantity;
        }
        // If product is not loaded, fetch it
        else {
          const product = await productRepository.getProductById(item.product_id);
          if (product) {
            totalPrice += product.price * item.quantity;
          }
        }
      }
    }
    
    return totalPrice;
  }
}; 