import { supabaseClient } from '../../../services/supabase/client';
import { 
  CreatePackageInput, 
  Package, 
  PackageFilters, 
  UpdatePackageInput 
} from '../domain/types';
import { DEFAULT_PACKAGE_VALUES } from '../domain/constants';

/**
 * Repository for package data operations
 */
export const packageRepository = {
  /**
   * Get all packages with optional filtering and pagination
   */
  async getPackages(
    filters?: PackageFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ packages: Package[]; totalCount: number }> {
    try {
      // Initial query builder
      let query = supabaseClient
        .from('packages')
        .select('*, package_items(*)', { count: 'exact' });

      // Apply filters if provided
      if (filters) {
        if (filters.active !== undefined) {
          query = query.eq('active', filters.active);
        }

        if (filters.min_price !== undefined) {
          query = query.gte('base_price', filters.min_price);
        }

        if (filters.max_price !== undefined) {
          query = query.lte('base_price', filters.max_price);
        }

        if (filters.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
          );
        }

        // Filter by packages containing a specific product
        if (filters.contains_product_id) {
          // First get the package IDs that contain the specified product
          const { data: packageItems } = await supabaseClient
            .from('package_items')
            .select('package_id')
            .eq('product_id', filters.contains_product_id);
          
          if (packageItems && packageItems.length > 0) {
            // Extract unique package IDs
            const packageIds = [...new Set(packageItems.map(item => item.package_id))];
            query = query.in('id', packageIds);
          } else {
            // No packages contain this product
            return { packages: [], totalCount: 0 };
          }
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

      // Process the returned data to format package items
      const packages = (data || []).map(pkg => ({
        ...pkg,
        items: pkg.package_items
      })) as Package[];

      return {
        packages,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },

  /**
   * Get a single package by ID with its items
   */
  async getPackageById(id: string): Promise<Package | null> {
    try {
      const { data, error } = await supabaseClient
        .from('packages')
        .select(`
          *,
          package_items(
            *,
            product:product_id(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        throw error;
      }

      // Process the returned data to format package items
      const packageData = {
        ...data,
        items: data.package_items
      } as Package;

      return packageData;
    } catch (error) {
      console.error(`Error fetching package with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new package with its items
   */
  async createPackage(packageData: CreatePackageInput): Promise<Package> {
    // Start a Supabase transaction
    const { data: client } = await supabaseClient.rpc('begin');
    
    try {
      // First, create the package
      const packageWithDefaults = {
        ...DEFAULT_PACKAGE_VALUES,
        name: packageData.name,
        description: packageData.description,
        base_price: packageData.base_price,
        active: packageData.active ?? DEFAULT_PACKAGE_VALUES.active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newPackage, error: packageError } = await supabaseClient
        .from('packages')
        .insert(packageWithDefaults)
        .select()
        .single();

      if (packageError) throw packageError;

      // Then create package items
      const packageItems = packageData.items.map(item => ({
        package_id: newPackage.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_override: item.price_override
      }));

      const { data: items, error: itemsError } = await supabaseClient
        .from('package_items')
        .insert(packageItems)
        .select();

      if (itemsError) throw itemsError;

      // Return the complete package with items
      return {
        ...newPackage,
        items
      } as Package;
    } catch (error) {
      // Roll back the transaction
      await supabaseClient.rpc('rollback');
      console.error('Error creating package:', error);
      throw error;
    }
  },

  /**
   * Update an existing package and its items
   */
  async updatePackage(packageData: UpdatePackageInput): Promise<Package> {
    // Start a Supabase transaction
    const { data: client } = await supabaseClient.rpc('begin');
    
    try {
      // First, update the package
      const updates = {
        name: packageData.name,
        description: packageData.description,
        base_price: packageData.base_price,
        active: packageData.active,
        updated_at: new Date().toISOString()
      };

      // Remove undefined fields
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
          delete updates[key];
        }
      });

      const { data: updatedPackage, error: packageError } = await supabaseClient
        .from('packages')
        .update(updates)
        .eq('id', packageData.id)
        .select()
        .single();

      if (packageError) throw packageError;

      // If items are provided, update them
      if (packageData.items) {
        // Get existing items to determine what to update/insert/delete
        const { data: existingItems, error: getItemsError } = await supabaseClient
          .from('package_items')
          .select('*')
          .eq('package_id', packageData.id);

        if (getItemsError) throw getItemsError;

        // Create maps for easier lookup
        const existingItemMap = new Map();
        existingItems?.forEach(item => {
          existingItemMap.set(item.id, item);
        });

        const newItemMap = new Map();
        packageData.items.forEach(item => {
          if (item.id) {
            newItemMap.set(item.id, item);
          }
        });

        // Items to update (have an ID that matches an existing item)
        const itemsToUpdate = packageData.items
          .filter(item => item.id && existingItemMap.has(item.id))
          .map(item => ({
            id: item.id,
            package_id: packageData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_override: item.price_override
          }));

        // Items to insert (no ID)
        const itemsToInsert = packageData.items
          .filter(item => !item.id)
          .map(item => ({
            package_id: packageData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_override: item.price_override
          }));

        // Items to delete (in existing but not in new)
        const itemsToDelete = existingItems
          ?.filter(item => !newItemMap.has(item.id))
          .map(item => item.id) || [];

        // Perform updates
        if (itemsToUpdate.length > 0) {
          const { error: updateError } = await supabaseClient
            .from('package_items')
            .upsert(itemsToUpdate);

          if (updateError) throw updateError;
        }

        // Perform inserts
        if (itemsToInsert.length > 0) {
          const { error: insertError } = await supabaseClient
            .from('package_items')
            .insert(itemsToInsert);

          if (insertError) throw insertError;
        }

        // Perform deletes
        if (itemsToDelete.length > 0) {
          const { error: deleteError } = await supabaseClient
            .from('package_items')
            .delete()
            .in('id', itemsToDelete);

          if (deleteError) throw deleteError;
        }
      }

      // Get the updated package with all items
      return this.getPackageById(packageData.id) as Promise<Package>;
    } catch (error) {
      // Roll back the transaction
      await supabaseClient.rpc('rollback');
      console.error(`Error updating package with ID ${packageData.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a package by ID (including all its items)
   */
  async deletePackage(id: string): Promise<boolean> {
    try {
      // First delete all package items
      const { error: itemsError } = await supabaseClient
        .from('package_items')
        .delete()
        .eq('package_id', id);

      if (itemsError) throw itemsError;

      // Then delete the package
      const { error: packageError } = await supabaseClient
        .from('packages')
        .delete()
        .eq('id', id);

      if (packageError) throw packageError;

      return true;
    } catch (error) {
      console.error(`Error deleting package with ID ${id}:`, error);
      throw error;
    }
  }
}; 