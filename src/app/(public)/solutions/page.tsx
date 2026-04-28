import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

async function getSolutions() {
  const [solutionsRes, productsRes] = await Promise.all([
    supabase.from('solutions').select('*').order('sort_order'),
    supabase.from('products').select('id, name, model'),
  ]);

  return {
    solutions: solutionsRes.data || [],
    productsMap: new Map(
      (productsRes.data || []).map((p: any) => [p.id, p])
    ),
  };
}

export default async function SolutionsPage() {
  const { solutions, productsMap } = await getSolutions();

  return (
    <>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">解决方案</h1>
          <p className="text-blue-200 max-w-2xl text-lg">
            深耕核心工业领域，提供从传感器到机器人的端到端智能化解决方案，助力企业降本增效。
          </p>
        </div>
      </div>

      {/* Solutions List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
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
                className={`flex flex-col md:flex-row gap-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <div className="md:w-2/5 aspect-video md:aspect-auto bg-gray-100">
                  {sol.image_url ? (
                    <img
                      src={sol.image_url}
                      alt={sol.industry_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
                      <span className="text-green-300 text-7xl font-bold">
                        {sol.industry_name[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {sol.industry_name}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {sol.description}
                  </p>

                  {relatedProducts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        关联产品
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {relatedProducts.map((product: any) => (
                          <Link
                            key={product.id}
                            href={`/products?category=${product.category_id || ''}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">暂无解决方案</p>
          </div>
        )}
      </div>
    </>
  );
}
