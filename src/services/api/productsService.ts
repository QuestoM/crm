import { supabase } from '../supabase/client';
import { ServiceResponse } from './supabaseService';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  maintenance_interval?: number; // in days
  installation_time?: number; // in minutes
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

/**
 * Get products with pagination and filtering
 */
export async function getProducts(
  page = 1, 
  pageSize = 10, 
  filters: ProductFilters = {},
  sortBy = 'name',
  sortDirection: 'asc' | 'desc' = 'asc'
): Promise<ServiceResponse<ProductListResponse>> {
  try {
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters.inStock) {
      query = query.gt('stock', 0);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'query_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true,
      data: {
        products: data as Product[],
        total: count || 0
      }
    };
  } catch (err) {
    console.error('Error fetching products:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string): Promise<ServiceResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'query_error',
          message: error.message
        }
      };
    }
    
    if (!data) {
      return {
        success: false,
        error: {
          code: 'not_found',
          message: 'Product not found'
        }
      };
    }
    
    return {
      success: true,
      data: data as Product
    };
  } catch (err) {
    console.error('Error fetching product:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Create a new product
 */
export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<ServiceResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'insert_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true,
      data: data as Product
    };
  } catch (err) {
    console.error('Error creating product:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<ServiceResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'update_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true,
      data: data as Product
    };
  } catch (err) {
    console.error('Error updating product:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Update product stock quantity
 */
export async function updateProductStock(id: string, quantity: number): Promise<ServiceResponse<Product>> {
  try {
    // First, get the current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', id)
      .single();
    
    if (fetchError || !product) {
      return {
        success: false,
        error: {
          code: 'query_error',
          message: fetchError?.message || 'Product not found'
        }
      };
    }
    
    // Calculate new stock level
    const newStock = product.stock + quantity;
    
    // Update the stock
    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'update_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true,
      data: data as Product
    };
  } catch (err) {
    console.error('Error updating product stock:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<ServiceResponse<void>> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      return {
        success: false,
        error: {
          code: 'delete_error',
          message: error.message
        }
      };
    }
    
    return {
      success: true
    };
  } catch (err) {
    console.error('Error deleting product:', err);
    return {
      success: false,
      error: {
        code: 'unexpected_error',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      }
    };
  }
} 