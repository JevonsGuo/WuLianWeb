import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const revalidate = 30;

async function getSolutions() {
  const [solutionsRes, productsRes] = await Promise.all([
    supabaseAdmin.from('solutions').select('*').order('sort_order'),
    supabaseAdmin.from('products').select('id, name, model, category_id'),
  ]);
  return {
    solutions: solutionsRes.data || [],
    productsMap: new Map((productsRes.data || []).map((p: any) => [p.id, p])),
  };
}

export default async function SolutionsPage() {
  const { solutions, productsMap } = await getSolutions();

  return (
    <>
      {/* Page Header */}
      <div className="relative overflow-hidden bg-surface-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">解决方案</h1>
          <p className="text-surface-300 max-w-2xl text-lg leading-relaxed">
            深耕核心工业领域，提供从传感器到机器人的端到端智能化解决方案，助力企业降本增效。
          </p>
        </div>
      </div>

      {/* Solutions List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {solutions.map((sol: any, index: number) => {
            const relatedIds: string[] = sol.related_product_ids
              ? JSON.parse(sol.related_product_ids)
              : [];
            const relatedProducts = relatedIds
              .map((id: string) => productsMap.get(id))
              .filter(Boolean);

            return (
              <div
                key={sol.id}
                className={`group bg-white rounded-2xl border border-surface-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-400 flex flex-col md:flex-row ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <div className="md:w-2/5 aspect-video md:aspect-auto min-h-[260px] bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
                  {sol.image_url ? (
                    <img
                      src={sol.image_url}
                      alt={sol.industry_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-emerald-200 text-8xl font-bold">
                        {sol.industry_name[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-surface-900 mb-4 tracking-tight">
                    {sol.industry_name}
                  </h2>
                  <p className="text-surface-500 leading-relaxed mb-6">
                    {sol.description}
                  </p>

                  {relatedProducts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                        关联产品
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {relatedProducts.map((product: any) => (
                          <Link
                            key={product.id}
                            href={`/products?category=${product.category_id || ''}&product=${product.id}`}
                            className="inline-flex items-center px-3.5 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors duration-200"
                          >
                            {product.name}（{product.model}）
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {solutions.length === 0 && (
          <div className="text-center py-20 text-surface-400">
            <p className="text-lg">暂无解决方案</p>
          </div>
        )}
      </div>
    </>
  );
}
