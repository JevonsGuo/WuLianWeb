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
  image_urls: string[];
  main_image_url: string;
  summary_content: string;       // HTML
  specifications_content: string; // HTML
  manual_url: string;
  certificate_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface ProductAttachment {
  id: string;
  product_id: string;
  file_name: string;
  file_url: string;
  file_type: string; // 'certificate' | 'manual' | 'other'
  file_size: number | null;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Solution {
  id: string;
  industry_name: string;
  image_url: string;
  description: string;
  related_product_ids: string;
  sort_order: number;
  created_at: string;
}
