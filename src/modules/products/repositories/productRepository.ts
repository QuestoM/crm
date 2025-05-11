import { supabaseClient } from '../../../services/supabase/client';
import { 
  CreateProductInput, 
  Product, 
  ProductFilters, 
  UpdateProductInput 
} from '../domain/types';
import { DEFAULT_PRODUCT_VALUES } from '../domain/constants';

/**
 * Repository for product data operations
 */
export const productRepository = {
  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts(
    filters?: ProductFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ products: Product[]; totalCount: number }> {
    try {
      // Initial query builder
      let query = supabaseClient
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        if (filters.active !== undefined) {
          query = query.eq('active', filters.active);
        }

        if (filters.min_price !== undefined) {
          query = query.gte('price', filters.min_price);
        }

        if (filters.max_price !== undefined) {
          query = query.lte('price', filters.max_price);
        }

        if (filters.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }

        // Complex filter for products with warranties
        if (filters.has_warranty) {
          query = query.gt('warranty_months', 0);
        }
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('name', { ascending: true })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: (data || []) as Product[],
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      return data as Product;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductInput): Promise<Product> {
    try {
      const productWithDefaults = {
        ...DEFAULT_PRODUCT_VALUES,
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('products')
        .insert(productWithDefaults)
        .select()
        .single();

      if (error) throw error;

      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update an existing product
   */
  async updateProduct(productData: UpdateProductInput): Promise<Product> {
    try {
      const updates = {
        ...productData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('products')
        .update(updates)
        .eq('id', productData.id)
        .select()
        .single();

      if (error) throw error;

      return data as Product;
    } catch (error) {
      console.error(`Error updating product with ID ${productData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product by ID
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Check if a product with the given SKU already exists
   */
  async isSkuUnique(sku: string, excludeProductId?: string): Promise<boolean> {
    try {
      let query = supabaseClient
        .from('products')
        .select('id')
        .eq('sku', sku);
      
      // Exclude the current product when checking for updates
      if (excludeProductId) {
        query = query.neq('id', excludeProductId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // SKU is unique if no products with that SKU were found
      return !data || data.length === 0;
    } catch (error) {
      console.error(`Error checking if SKU ${sku} is unique:`, error);
      throw error;
    }
  }
}; 