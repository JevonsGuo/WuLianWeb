'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProductCategory, Product, ProductAttachment } from '@/lib/types';
import CategoryList from '@/components/CategoryList';
import ProductList from '@/components/ProductList';
import ProductDetail from '@/components/ProductDetail';
import { Package } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order');
      if (data && data.length > 0) {
        setCategories(data);
        setSelectedCategoryId(categoryParam || data[0].id);
      }
      setLoading(false);
    }
    fetchCategories();
  }, [categoryParam]);

  const fetchProducts = useCallback(async (categoryId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');
    setProducts(data || []);
    if (data && data.length > 0) {
      setSelectedProductId(data[0].id);
    } else {
      setSelectedProductId(null);
    }
  }, []);

  useEffect(() => {
    if (selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (!selectedProductId) { setAttachments([]); return; }
    async function fetchAttachments() {
      const { data } = await supabase
        .from('product_attachments')
        .select('*')
        .eq('product_id', selectedProductId)
        .order('sort_order');
      setAttachments(data || []);
    }
    fetchAttachments();
  }, [selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedProductId(null);
    setAttachments([]);
  };

  const handleProductSelect = (id: string) => setSelectedProductId(id);

  if (loading) {
    return (
      <div className="bg-surface-50 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-pulse text-surface-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-64px)] flex three-column-layout">
      {/* Left: Categories */}
      <div className="w-[260px] shrink-0 border-r border-surface-200/60 overflow-hidden">
        <CategoryList
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Middle: Products */}
      <div className="w-[300px] shrink-0 border-r border-surface-200/60 overflow-hidden">
        <ProductList
          products={products}
          selectedId={selectedProductId}
          onSelect={handleProductSelect}
        />
      </div>

      {/* Right: Detail */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {selectedProduct ? (
          <ProductDetail product={selectedProduct} attachments={attachments} />
        ) : (
          <div className="h-full flex items-center justify-center text-surface-400">
            <div className="text-center">
              <Package size={48} className="mx-auto mb-4 text-surface-200" />
              <p className="text-base font-medium">请选择一个产品</p>
              <p className="text-sm mt-1 text-surface-300">从左侧选择大类，再选择具体产品查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-50 h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="animate-pulse text-surface-400">加载中...</div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
