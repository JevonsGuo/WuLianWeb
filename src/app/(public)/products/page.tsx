'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const [productsKey, setProductsKey] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/categories');
      const result = await res.json();
      const data = result.data || [];
      if (data.length > 0) {
        setCategories(data);
        if (categoryParam) {
          setSelectedCategoryId(categoryParam);
        }
      }
      setLoading(false);
    }
    fetchCategories();
  }, [categoryParam]);

  const fetchProducts = useCallback(async (categoryId: string) => {
    const res = await fetch(`/api/products?category_id=${categoryId}`);
    const result = await res.json();
    setProducts(result.data || []);
  }, []);

  useEffect(() => {
    if (selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (!selectedProductId) { setAttachments([]); return; }
    async function fetchAttachments() {
      const res = await fetch(`/api/attachments?product_id=${selectedProductId}`);
      const result = await res.json();
      setAttachments(result.data || []);
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
  };

  const handleProductSelect = (id: string) => setSelectedProductId(id);

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-pulse text-surface-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="products-page-wrapper h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto h-full bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
        <div className="border-b border-surface-200/60">
          <div className="px-6 pt-4 pb-1">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest">产品大类</h2>
          </div>
          <CategoryList
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={handleCategorySelect}
          />
        </div>

        {selectedCategoryId && (
          <div key={productsKey} className="border-b border-surface-200/60 animate-slide-up">
            <div className="px-6 pt-4 pb-1">
              <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-widest">产品列表</h2>
            </div>
            <ProductList
              products={products}
              selectedId={selectedProductId}
              onSelect={handleProductSelect}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          {selectedProduct ? (
            <div key={selectedProduct.id} className="h-full animate-fade-in">
              <ProductDetail product={selectedProduct} attachments={attachments} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-surface-400 bg-surface-50/30">
              <div className="text-center">
                <Package size={48} className="mx-auto mb-4 text-surface-200" />
                <p className="text-base font-medium">请选择一个产品</p>
                <p className="text-sm mt-1 text-surface-300">
                  {selectedCategoryId
                    ? '从产品列表中选择具体产品查看详情'
                    : '请先选择一个产品大类'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="animate-pulse text-surface-400">加载中...</div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
