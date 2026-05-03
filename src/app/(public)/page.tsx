import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ArrowRight } from 'lucide-react';
import CategoryCarousel from '@/components/CategoryCarousel';
import SolutionCarousel from '@/components/SolutionCarousel';

export const revalidate = 30;

async function getHomeData() {
  const [categoriesRes, solutionsRes] = await Promise.all([
    supabaseAdmin.from('product_categories').select('*').order('sort_order'),
    supabaseAdmin.from('solutions').select('*').order('sort_order'),
  ]);
  return {
    categories: categoriesRes.data || [],
    solutions: solutionsRes.data || [],
  };
}

export default async function HomePage() {
  const { categories, solutions } = await getHomeData();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-900">
        {/* Decorative gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-700/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 pattern-bg opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6">
              工业物联网 · 智能制造
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              智造未来
              <br />
              <span className="gradient-text">物联无限</span>
            </h1>
            <p className="text-lg md:text-xl text-surface-300 max-w-2xl mb-10 leading-relaxed">
              专业的工业物联网设备与解决方案提供商，以智能传感器、工业机器人和视觉检测技术，赋能制造业数字化转型。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center px-7 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-500/30"
              >
                浏览产品
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex items-center px-7 py-3.5 border border-surface-500/30 text-surface-200 font-semibold rounded-xl hover:bg-white/5 hover:border-surface-400/50 transition-all duration-300"
              >
                解决方案
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4 tracking-tight">产品大类</h2>
            <p className="text-surface-500 max-w-2xl mx-auto leading-relaxed">
              涵盖多类核心产品线，满足不同工业场景需求。
            </p>
          </div>
          <CategoryCarousel categories={categories} />
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4 tracking-tight">行业解决方案</h2>
            <p className="text-surface-500 max-w-2xl mx-auto leading-relaxed">
              深耕汽车制造、食品包装、电子制造等核心行业，提供端到端智能化解决方案。
            </p>
          </div>
          <SolutionCarousel solutions={solutions} />
        </div>
      </section>
    </>
  );
}
