import { supabaseAdmin } from '@/lib/supabaseAdmin';
import SolutionsAccordion from '@/components/SolutionsAccordion';

export const revalidate = 30;

async function getSolutions() {
  const [solutionsRes, productsRes, categoriesRes] = await Promise.all([
    supabaseAdmin.from('solutions').select('*').order('sort_order'),
    supabaseAdmin.from('products').select('id, name, model, category_id'),
    supabaseAdmin.from('product_categories').select('id, slug'),
  ]);
  const categoriesMap = new Map((categoriesRes.data || []).map((c: any) => [c.id, c.slug]));
  return {
    solutions: solutionsRes.data || [],
    productsMap: new Map((productsRes.data || []).map((p: any) => [p.id, p])),
    categoriesMap,
  };
}

export default async function SolutionsPage() {
  const { solutions, productsMap, categoriesMap } = await getSolutions();

  return (
    <>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SolutionsAccordion
          solutions={solutions}
          productsMap={productsMap}
          categoriesMap={categoriesMap}
        />
      </div>
    </>
  );
}
