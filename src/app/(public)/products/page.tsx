'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProductCategory, Product, ProductAttachment } from '@/lib/types';
import CategoryList from '@/components/CategoryList';
import ProductList from '@/components/ProductList';
import ProductDetail from '@/components/ProductDetail';
import { Package, Layers } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [productsKey, setProductsKey] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order');
      if (data && data.length > 0) {
        setCategories(data);
        if (categoryParam) {
          setSelectedCategoryId(categoryParam);
          setShowProducts(true);
        }
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
    setProducts([]);
    setProductsKey((k) => k + 1);
    setShowProducts(true);
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
      <div className="w-[260px] shrink-0 border-r border-surface-200/60 overflow-hidden">
        <CategoryList
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleCategorySelect}
        />
      </div>

      {showProducts ? (
        <div
          key={productsKey}
          className="w-[300px] shrink-0 border-r border-surface-200/60 overflow-hidden animate-slide-in-right"
        >
          <ProductList
            products={products}
            selectedId={selectedProductId}
            onSelect={handleProductSelect}
          />
        </div>
      ) : (
        <div className="w-[300px] shrink-0 border-r border-surface-200/60 overflow-hidden flex items-center justify-center text-surface-400 bg-surface-50/30">
          <div className="text-center px-5">
            <Layers size={40} className="mx-auto mb-4 text-surface-200" />
            <p className="text-sm font-medium text-surface-400">选择产品大类</p>
            <p className="text-xs mt-1.5 text-surface-300 leading-relaxed">从左侧选择一个分类，查看该分类下的产品列表</p>
          </div>
        </div>
      )}

      {selectedProduct ? (
        <div className="flex-1 min-w-0 overflow-hidden animate-slide-in-right">
          <ProductDetail product={selectedProduct} attachments={attachments} />
        </div>
      ) : (
        <div className="flex-1 min-w-0 overflow-hidden flex items-center justify-center text-surface-400 bg-surface-50/30">
          <div className="text-center">
            <Package size={48} className="mx-auto mb-4 text-surface-200" />
            <p className="text-base font-medium">请选择一个产品</p>
            <p className="text-sm mt-1 text-surface-300">
              {showProducts
                ? '从产品列表中选择具体产品查看详情'
                : '请先选择一个产品大类'}
            </p>
          </div>
        </div>
      )}
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
