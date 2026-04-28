import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '物联智造 - 工业物联网设备与解决方案',
  description: '专业的工业物联网设备提供商，提供智能传感器、工业机器人、视觉检测系统等产品及行业解决方案。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
