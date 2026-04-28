export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 公司信息 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">物</span>
              </div>
              <span className="text-lg font-bold text-white">物联智造</span>
            </div>
            <p className="text-sm leading-relaxed">
              专业的工业物联网设备与解决方案提供商，致力于为制造业数字化转型提供核心硬件与系统支撑。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">首页</a></li>
              <li><a href="/products" className="hover:text-white transition-colors">产品中心</a></li>
              <li><a href="/solutions" className="hover:text-white transition-colors">解决方案</a></li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-white font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2 text-sm">
              <li>邮箱：contact@wulian-tech.com</li>
              <li>地址：上海市浦东新区张江高科</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2024 物联智造科技有限公司 版权所有</p>
        </div>
      </div>
    </footer>
  );
}
