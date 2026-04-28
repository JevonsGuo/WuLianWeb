# 物联智造 - 工业物联网设备产品展示网站

## 技术栈
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Supabase (PostgreSQL + Storage)
- Radix UI Dialog
- Lucide React Icons

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.local` 文件，填入你的 Supabase 配置：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_admin_password
```

### 3. 初始化数据库
在 Supabase SQL Editor 中执行 `supabase/migration.sql`

### 4. 创建 Storage Buckets
在 Supabase Storage 中创建以下 Public Buckets：
- `product-images`
- `solution-images`
- `documents`

### 5. 启动开发服务器
```bash
npm run dev
```

## 页面说明
| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 公司介绍、产品大类快速入口、解决方案入口 |
| 产品中心 | `/products` | 左侧大类切换 + 右侧产品网格 + 弹窗详情 |
| 解决方案 | `/solutions` | 按行业展示解决方案 |
| 后台登录 | `/admin/login` | 简易密码登录 |
| 大类管理 | `/admin/categories` | 产品大类 CRUD |
| 产品管理 | `/admin/products` | 产品 CRUD + 文件上传 |
| 解决方案管理 | `/admin/solutions` | 解决方案 CRUD |

## 部署到 Vercel
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署
