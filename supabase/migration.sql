-- =============================================
-- 物联网设备公司产品展示网站 - 数据库迁移脚本
-- 在 Supabase SQL Editor 中执行（可重复执行）
-- 启用 RLS：匿名用户只读，写操作通过 service_role key 在 API 路由中完成
-- =============================================

-- 1. 删除旧表（清除所有历史数据）
DROP TABLE IF EXISTS solutions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;

-- 2. 创建产品大类表
CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 创建产品表（image_urls 为多图数组）
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  model text NOT NULL,
  description text,
  image_urls text[] DEFAULT '{}',
  manual_url text,
  certificate_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. 创建解决方案表
CREATE TABLE solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_name text NOT NULL,
  image_url text,
  description text,
  related_product_ids text DEFAULT '[]',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. 启用 RLS（Row Level Security）
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- 6. RLS 策略：匿名用户（anon key）只能读取数据
CREATE POLICY "Public read product_categories" ON product_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public read solutions" ON solutions
  FOR SELECT USING (true);

-- 注意：写操作（INSERT/UPDATE/DELETE）不开放给 anon 用户，
-- 只能通过 service_role key 在服务端 API 路由中执行（service_role 绕过 RLS）。

-- 7. 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 示例数据（图片使用 Unsplash 网络链接）
-- =============================================

-- 产品大类
INSERT INTO product_categories (id, name, image_url, sort_order) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', '智能传感器', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', 1),
  ('a1b2c3d4-0001-4000-8000-000000000002', '工业机器人', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', 2),
  ('a1b2c3d4-0001-4000-8000-000000000003', '视觉检测系统', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 3);

-- 智能传感器下的产品（每个产品含多张图片）
INSERT INTO products (id, category_id, name, model, description, image_urls, manual_url, certificate_url, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
   '高精度激光测距传感器', 'LS-1000',
   '测量范围 0.1-50m，精度 ±1mm，适用于工业自动化距离测量与定位场景。支持 RS485/Modbus 通信协议，响应时间 <5ms。',
   ARRAY[
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1581091226825-a6a2a83a863c?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop'
   ], '', '', 1),

  ('b1b2c3d4-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001',
   '工业级温度传感器', 'TS-2000',
   '测温范围 -40°C 到 125°C，IP67 防护等级，4-20mA 模拟输出。适用于恶劣工业环境下的温度监测。',
   ARRAY[
     'https://images.unsplash.com/photo-1581091226825-a6a2a83a863c?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'
   ], '', '', 2),

  ('b1b2c3d4-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001',
   '多轴加速度传感器', 'AS-3000',
   '6 轴加速度 + 陀螺仪，高精度 IMU 模块，适用于振动监测与姿态检测。支持 SPI/I2C 接口。',
   ARRAY[
     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1581091226825-a6a2a83a863c?w=600&h=600&fit=crop'
   ], '', '', 3);

-- 工业机器人下的产品
INSERT INTO products (id, category_id, name, model, description, image_urls, manual_url, certificate_url, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000002',
   '六轴协作机器人', 'CR-600',
   '负载 6kg，臂展 900mm，重复定位精度 ±0.02mm。支持拖拽示教与图形化编程，适用于柔性产线。',
   ARRAY[
     'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1561557944-6e7876e5c7cf?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'
   ], '', '', 1),

  ('b1b2c3d4-0001-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000002',
   'SCARA 高速分拣机器人', 'SR-400',
   '负载 3kg，循环时间 0.4s，适用于电子元器件高速分拣与装配。支持视觉引导。',
   ARRAY[
     'https://images.unsplash.com/photo-1561557944-6e7876e5c7cf?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=600&fit=crop'
   ], '', '', 2);

-- 视觉检测系统下的产品
INSERT INTO products (id, category_id, name, model, description, image_urls, manual_url, certificate_url, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000006', 'a1b2c3d4-0001-4000-8000-000000000003',
   '工业 3D 视觉检测系统', 'VS-8000',
   '千万级像素 3D 相机，检测精度 0.01mm，集成深度学习算法。适用于表面缺陷检测与尺寸测量。',
   ARRAY[
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop'
   ], '', '', 1),

  ('b1b2c3d4-0001-4000-8000-000000000007', 'a1b2c3d4-0001-4000-8000-000000000003',
   '智能 barcode/QR 读码器', 'BC-500',
   '高速一维/二维条码读取，读取速度 >60 次/秒，IP65 防护。适用于产线追溯与物流分拣。',
   ARRAY[
     'https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop'
   ], '', '', 2);

-- 解决方案
INSERT INTO solutions (id, industry_name, image_url, description, related_product_ids, sort_order) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001',
   '汽车制造', 'https://images.unsplash.com/photo-1569245866392-efc78adc6ba2?w=800&h=500&fit=crop',
   '为焊装、涂装、总装线提供机器人+视觉检测一体化方案。实现车身焊接质量在线检测、涂装表面缺陷自动识别、总装零部件错漏装防错，助力汽车制造产线智能化升级。',
   '["b1b2c3d4-0001-4000-8000-000000000004","b1b2c3d4-0001-4000-8000-000000000006"]', 1),

  ('c1b2c3d4-0001-4000-8000-000000000002',
   '食品包装', 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=500&fit=crop',
   '高速包装线中的异物检测与分拣机器人方案。通过视觉系统实时检测食品中的异物（金属、塑料等），配合 SCARA 机器人实现高速自动剔除，保障食品安全。',
   '["b1b2c3d4-0001-4000-8000-000000000002","b1b2c3d4-0001-4000-8000-000000000005","b1b2c3d4-0001-4000-8000-000000000006"]', 2),

  ('c1b2c3d4-0001-4000-8000-000000000003',
   '电子制造', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
   'PCB 板缺陷检测与元器件贴装精度验证方案。通过 3D 视觉系统检测焊点缺陷、元器件偏移与缺失，配合传感器实时监控产线温湿度，确保电子制造品质稳定。',
   '["b1b2c3d4-0001-4000-8000-000000000003","b1b2c3d4-0001-4000-8000-000000000006","b1b2c3d4-0001-4000-8000-000000000007"]', 3);
