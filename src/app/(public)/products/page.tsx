'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ProductCategory, Product, ProductAttachment } from '@/lib/types';
import CategoryList from '@/components/CategoryList';
import ProductList from '@/components/ProductList';
import ProductDetail from '@/components/ProductDetail';
import { Package, Layers, Search, X } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryParam = searchParams.get('category');
  const productParam = searchParams.get('product');

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [productsKey, setProductsKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const initialProductParam = useRef(productParam);
  const initialCategoryResolved = useRef(false);

  const isSearchMode = searchQuery.trim().length > 0;

  const searchResults = isSearchMode
    ? allProducts.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        return p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q);
      })
    : [];

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/categories');
      const result = await res.json();
      const data: ProductCategory[] = result.data || [];
      if (data.length > 0) {
        setCategories(data);
        if (categoryParam) {
          const match = data.find((c) => c.slug === categoryParam);
          if (match) {
            setSelectedCategoryId(match.id);
            setShowProducts(true);
          }
        }
      }
      setLoading(false);
    }
    fetchCategories();
  }, [categoryParam]);

  useEffect(() => {
    async function fetchAllProducts() {
      const res = await fetch('/api/products');
      const result = await res.json();
      setAllProducts(result.data || []);
    }
    fetchAllProducts();
  }, []);

  const fetchProducts = useCallback(async (categoryId: string) => {
    setProductsLoading(true);
    const res = await fetch(`/api/products?category_id=${categoryId}`);
    const result = await res.json();
    const data: Product[] = result.data || [];
    setProducts(data);
    setProductsLoading(false);
    return data;
  }, []);

  useEffect(() => {
    if (selectedCategoryId) fetchProducts(selectedCategoryId);
  }, [selectedCategoryId, fetchProducts]);

  useEffect(() => {
    if (initialCategoryResolved.current || !selectedCategoryId || productsLoading) return;
    if (products.length > 0 && initialProductParam.current) {
      const matched = products.find((p) => p.model === initialProductParam.current);
      if (matched) {
        setSelectedProductId(matched.id);
        initialCategoryResolved.current = true;
      }
    }
  }, [products, selectedCategoryId, productsLoading]);

  useEffect(() => {
    if (!selectedProductId) { setAttachments([]); return; }
    async function fetchAttachments() {
      const res = await fetch(`/api/attachments?product_id=${selectedProductId}`);
      const result = await res.json();
      setAttachments(result.data || []);
    }
    fetchAttachments();
  }, [selectedProductId]);

  const selectedProduct = isSearchMode
    ? allProducts.find((p) => p.id === selectedProductId) || null
    : products.find((p) => p.id === selectedProductId) || null;

  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedProductId(null);
    setAttachments([]);
    setProductsKey((k) => k + 1);
    setShowProducts(true);
    const cat = categories.find((c) => c.id === id);
    router.replace(`${pathname}?category=${cat?.slug || ''}`);
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    if (isSearchMode) return;
    const product = products.find((p) => p.id === id);
    const cat = categories.find((c) => c.id === selectedCategoryId);
    const params = new URLSearchParams();
    if (cat?.slug) params.set('category', cat.slug);
    if (product?.model) params.set('product', product.model);
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-pulse text-surface-400">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden bg-surface-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">产品中心</h1>
          <p className="text-surface-300 max-w-2xl text-lg leading-relaxed">
            涵盖多类核心产品线，提供从智能传感器到工业机器人的全方位产品，满足不同工业场景需求。
          </p>
        </div>
      </div>

      <div className="products-page-wrapper px-4 sm:px-6 lg:px-8 py-4 relative overflow-hidden" style={{ height: 'calc(100vh - 64px - 160px)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-800 to-brand-900" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto h-full flex flex-col relative">
        {isSearchMode && (
          <div className="mb-3 flex items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索产品名称或型号..."
                className="w-full pl-9 pr-9 py-2.5 border border-surface-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 bg-white/95 shadow-sm"
                autoFocus
              />
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <span className="text-sm text-surface-400">
              找到 <span className="font-semibold text-brand-600">{searchResults.length}</span> 个产品
            </span>
          </div>
        )}

        {!isSearchMode && (
          <div className="mb-3">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索产品名称或型号..."
                className="w-full pl-9 pr-4 py-2.5 border border-surface-200/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 bg-white/80 shadow-sm"
              />
            </div>
          </div>
        )}

        <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-card overflow-hidden flex three-column-layout min-h-0">
          <div className="w-[260px] shrink-0 border-r border-surface-200/60 overflow-hidden">
            <CategoryList
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={handleCategorySelect}
              disabled={isSearchMode}
            />
          </div>

          {isSearchMode ? (
            <div className="w-[300px] shrink-0 border-r border-surface-200/60 overflow-hidden">
              <ProductList
                products={searchResults}
                selectedId={selectedProductId}
                onSelect={handleProductSelect}
                categories={categories}
                showCategory
              />
            </div>
          ) : showProducts ? (
            <div
              key={productsKey}
              className="w-[300px] shrink-0 border-r border-surface-200/60 overflow-hidden animate-slide-in-right"
            >
              <ProductList
                products={products}
                selectedId={selectedProductId}
                onSelect={handleProductSelect}
                loading={productsLoading}
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
            <div key={selectedProduct.id} className="flex-1 min-w-0 overflow-hidden animate-slide-in-right">
              <ProductDetail product={selectedProduct} attachments={attachments} />
            </div>
          ) : (
            <div className="flex-1 min-w-0 overflow-hidden flex items-center justify-center text-surface-400 bg-surface-50/30">
              <div className="text-center">
                <Package size={48} className="mx-auto mb-4 text-surface-200" />
                <p className="text-base font-medium">请选择一个产品</p>
                <p className="text-sm mt-1 text-surface-300">
                  {isSearchMode
                    ? '从搜索结果中选择产品查看详情'
                    : showProducts
                      ? '从产品列表中选择具体产品查看详情'
                      : '请先选择一个产品大类'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
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
