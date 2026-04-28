export interface ProductCategory {
  id: string;
  name: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  model: string;
  description: string;
  image_url: string;
  manual_url: string;
  certificate_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined field
  category_name?: string;
}

export interface Solution {
  id: string;
  industry_name: string;
  image_url: string;
  description: string;
  related_product_ids: string; // JSON string of product IDs
  sort_order: number;
  created_at: string;
}
