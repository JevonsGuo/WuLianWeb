import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <div className="relative overflow-hidden bg-surface-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">联系我们</h1>
          <p className="text-surface-300 max-w-2xl text-lg leading-relaxed">
            期待与您的合作，欢迎随时联系我们的团队获取产品咨询与技术支持。
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-surface-200/80 p-6 shadow-card">
              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-900">电话咨询</h3>
                  <p className="text-surface-500 text-sm mt-1">400-888-6688</p>
                  <p className="text-surface-400 text-xs mt-1">工作日 9:00 - 18:00</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-200/80 p-6 shadow-card">
              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-900">电子邮件</h3>
                  <p className="text-surface-500 text-sm mt-1">contact@wulian-tech.com</p>
                  <p className="text-surface-400 text-xs mt-1">我们将在 24 小时内回复</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-200/80 p-6 shadow-card">
              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-900">公司地址</h3>
                  <p className="text-surface-500 text-sm mt-1">上海市浦东新区张江高科</p>
                  <p className="text-surface-400 text-xs mt-1">博云路2号浦软大厦 18F</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-200/80 p-6 shadow-card">
              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-surface-900">工作时间</h3>
                  <p className="text-surface-500 text-sm mt-1">周一至周五 9:00 - 18:00</p>
                  <p className="text-surface-400 text-xs mt-1">法定节假日除外</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-surface-200/80 p-8 shadow-card">
              <h2 className="text-xl font-bold text-surface-900 mb-1">发送消息</h2>
              <p className="text-surface-400 text-sm mb-8">填写以下表单，我们的团队会尽快与您取得联系</p>

              <form
                action="https://formsubmit.co/crab@gyfolk.com"
                method="POST"
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">姓名</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                      placeholder="您的姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">公司</label>
                    <input
                      type="text"
                      name="company"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                      placeholder="公司名称"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">邮箱</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                      placeholder="您的邮箱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">电话</label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                      placeholder="联系电话"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">咨询内容</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow resize-none"
                    placeholder="请描述您的需求或问题..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors duration-200 shadow-sm"
                >
                  <Send size={16} />
                  <span>发送消息</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
