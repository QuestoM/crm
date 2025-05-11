/**
 * Represents a product in the system
 */
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  active: boolean;
  warranty_months: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Represents input data for creating a new product
 */
export interface CreateProductInput {
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  active?: boolean;
  warranty_months: number;
}

/**
 * Represents input data for updating a product
 */
export interface UpdateProductInput {
  id: string;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  cost?: number;
  category?: string;
  active?: boolean;
  warranty_months?: number;
}

/**
 * Product filtering options
 */
export interface ProductFilters {
  search?: string;
  category?: string;
  active?: boolean;
  min_price?: number;
  max_price?: number;
  has_warranty?: boolean;
}

/**
 * Represents a package of products
 */
export interface Package {
  id: string;
  name: string;
  description: string;
  base_price: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  items?: PackageItem[];
}

/**
 * Represents a product item within a package
 */
export interface PackageItem {
  id: string;
  package_id: string;
  product_id: string;
  quantity: number;
  price_override?: number;
  product?: Product;
}

/**
 * Represents input data for creating a new package
 */
export interface CreatePackageInput {
  name: string;
  description: string;
  base_price: number;
  active?: boolean;
  items: Array<{
    product_id: string;
    quantity: number;
    price_override?: number;
  }>;
}

/**
 * Represents input data for updating a package
 */
export interface UpdatePackageInput {
  id: string;
  name?: string;
  description?: string;
  base_price?: number;
  active?: boolean;
  items?: Array<{
    id?: string;
    product_id: string;
    quantity: number;
    price_override?: number;
  }>;
}

/**
 * Package filtering options
 */
export interface PackageFilters {
  search?: string;
  active?: boolean;
  min_price?: number;
  max_price?: number;
  contains_product_id?: string;
} 