'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProductCategory, Product } from '@/lib/types';
import CategorySidebar from '@/components/CategorySidebar';
import ProductGrid from '@/components/ProductGrid';
import ProductModal from '@/components/ProductModal';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order');
      if (data && data.length > 0) {
        setCategories(data);
        setSelectedCategory(categoryParam || data[0].id);
      }
    }
    fetchCategories();
  }, [categoryParam]);

  // Fetch products when category changes
  const fetchProducts = useCallback(async (categoryId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory, fetchProducts]);

  // Handle category switch with animation
  const handleCategorySelect = (id: string) => {
    if (id === selectedCategory) return;
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedCategory(id);
      setIsAnimating(false);
    }, 200);
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 200);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">产品中心</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <CategorySidebar
            categories={categories}
            selectedId={selectedCategory}
            onSelect={handleCategorySelect}
          />
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid
                products={products}
                isAnimating={isAnimating}
                onProductClick={handleProductClick}
              />
            )}
          </div>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
