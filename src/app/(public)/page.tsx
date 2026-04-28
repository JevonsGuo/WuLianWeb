import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

async function getHomeData() {
  const [categoriesRes, solutionsRes] = await Promise.all([
    supabase
      .from('product_categories')
      .select('*')
      .order('sort_order')
      .limit(3),
    supabase
      .from('solutions')
      .select('*')
      .order('sort_order')
      .limit(3),
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            智造未来
            <br />
            <span className="text-blue-300">物联无限</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mb-8">
            专业的工业物联网设备与解决方案提供商，以智能传感器、工业机器人和视觉检测技术，赋能制造业数字化转型。
          </p>
          <div className="flex space-x-4">
            <Link
              href="/products"
              className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              浏览产品
            </Link>
            <Link
              href="/solutions"
              className="px-8 py-3 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              解决方案
            </Link>
          </div>
        </div>
      </section>

      {/* Product Categories Quick Access */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">产品大类</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              涵盖智能传感器、工业机器人、视觉检测系统三大核心产品线，满足不同工业场景需求。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-200 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-2xl font-bold">
                        {cat.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Quick Access */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">行业解决方案</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              深耕汽车制造、食品包装、电子制造等核心行业，提供端到端智能化解决方案。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {solutions.map((sol: any) => (
              <Link
                key={sol.id}
                href="/solutions"
                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                  {sol.image_url ? (
                    <img
                      src={sol.image_url}
                      alt={sol.industry_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-green-200 rounded-xl flex items-center justify-center">
                      <span className="text-green-700 text-2xl font-bold">
                        {sol.industry_name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {sol.industry_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {sol.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
