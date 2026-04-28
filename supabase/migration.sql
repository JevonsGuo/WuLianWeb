-- =============================================
-- 物联网设备公司产品展示网站 - 数据库迁移脚本
-- 在 Supabase SQL Editor 中执行
-- =============================================

-- 1. 创建产品大类表
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 创建产品表
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  model text NOT NULL,
  description text,
  image_url text,
  manual_url text,
  certificate_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 创建解决方案表
CREATE TABLE IF NOT EXISTS solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_name text NOT NULL,
  image_url text,
  description text,
  related_product_ids text DEFAULT '[]',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. 启用 RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- 5. 公开读取策略
CREATE POLICY "Public read categories" ON product_categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read solutions" ON solutions FOR SELECT USING (true);

-- 6. 写入策略（需要 anon key 即可写入，用于后台管理）
CREATE POLICY "Allow insert categories" ON product_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update categories" ON product_categories FOR UPDATE USING (true);
CREATE POLICY "Allow delete categories" ON product_categories FOR DELETE USING (true);

CREATE POLICY "Allow insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow delete products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow insert solutions" ON solutions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update solutions" ON solutions FOR UPDATE USING (true);
CREATE POLICY "Allow delete solutions" ON solutions FOR DELETE USING (true);

-- 7. 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- 示例数据
-- =============================================

-- 产品大类
INSERT INTO product_categories (id, name, image_url, sort_order) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', '智能传感器', '/images/categories/sensor.jpg', 1),
  ('a1b2c3d4-0001-4000-8000-000000000002', '工业机器人', '/images/categories/robot.jpg', 2),
  ('a1b2c3d4-0001-4000-8000-000000000003', '视觉检测系统', '/images/categories/vision.jpg', 3);

-- 智能传感器下的产品
INSERT INTO products (id, category_id, name, model, description, image_url, manual_url, certificate_url, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
   '高精度激光测距传感器', 'LS-1000',
   '测量范围 0.1-50m，精度 ±1mm，适用于工业自动化距离测量与定位场景。支持 RS485/Modbus 通信协议，响应时间 <5ms。',
   '/images/products/ls1000.jpg', '/docs/ls1000_manual.pdf', '/docs/ls1000_cert.pdf', 1),

  ('b1b2c3d4-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001',
   '工业级温度传感器', 'TS-2000',
   '测温范围 -40°C 到 125°C，IP67 防护等级，4-20mA 模拟输出。适用于恶劣工业环境下的温度监测。',
   '/images/products/ts2000.jpg', '/docs/ts2000_manual.pdf', '/docs/ts2000_cert.pdf', 2),

  ('b1b2c3d4-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001',
   '多轴加速度传感器', 'AS-3000',
   '6 轴加速度 + 陀螺仪，高精度 IMU 模块，适用于振动监测与姿态检测。支持 SPI/I2C 接口。',
   '/images/products/as3000.jpg', '/docs/as3000_manual.pdf', '/docs/as3000_cert.pdf', 3);

-- 工业机器人下的产品
INSERT INTO products (id, category_id, name, model, description, image_url, manual_url, certificate_url, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000002',
   '六轴协作机器人', 'CR-600',
   '负载 6kg，臂展 900mm，重复定位精度 ±0.02mm。支持拖拽示教与图形化编程，适用于柔性产线。',
   '/images/products/cr600.jpg', '/docs/cr600_manual.pdf', '/docs/cr600_cert.pdf', 1),

  ('b1b2c3d4-0001-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000002',
   'SCARA 高速分拣机器人', 'SR-400',
   '负载 3kg，循环时间 0.4s，适用于电子元器件高速分拣与装配。支持视觉引导。',
   '/images/products/sr400.jpg', '/docs/sr400_manual.pdf', '/docs/sr400_cert.pdf', 2);

-- 视觉检测系统下的产品
INSERT INTO products (id, category_id, name, model, description, image_url, manual_url, certificate_url, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000006', 'a1b2c3d4-0001-4000-8000-000000000003',
   '工业 3D 视觉检测系统', 'VS-8000',
   '千万级像素 3D 相机，检测精度 0.01mm，集成深度学习算法。适用于表面缺陷检测与尺寸测量。',
   '/images/products/vs8000.jpg', '/docs/vs8000_manual.pdf', '/docs/vs8000_cert.pdf', 1),

  ('b1b2c3d4-0001-4000-8000-000000000007', 'a1b2c3d4-0001-4000-8000-000000000003',
   '智能 barcode/QR 读码器', 'BC-500',
   '高速一维/二维条码读取，读取速度 >60 次/秒，IP65 防护。适用于产线追溯与物流分拣。',
   '/images/products/bc500.jpg', '/docs/bc500_manual.pdf', '/docs/bc500_cert.pdf', 2);

-- 解决方案
INSERT INTO solutions (id, industry_name, image_url, description, related_product_ids, sort_order) VALUES
  ('c1b2c3d4-0001-4000-8000-000000000001',
   '汽车制造', '/images/solutions/auto.jpg',
   '为焊装、涂装、总装线提供机器人+视觉检测一体化方案。实现车身焊接质量在线检测、涂装表面缺陷自动识别、总装零部件错漏装防错，助力汽车制造产线智能化升级。',
   '["b1b2c3d4-0001-4000-8000-000000000004","b1b2c3d4-0001-4000-8000-000000000006"]', 1),

  ('c1b2c3d4-0001-4000-8000-000000000002',
   '食品包装', '/images/solutions/food.jpg',
   '高速包装线中的异物检测与分拣机器人方案。通过视觉系统实时检测食品中的异物（金属、塑料等），配合 SCARA 机器人实现高速自动剔除，保障食品安全。',
   '["b1b2c3d4-0001-4000-8000-000000000002","b1b2c3d4-0001-4000-8000-000000000005","b1b2c3d4-0001-4000-8000-000000000006"]', 2),

  ('c1b2c3d4-0001-4000-8000-000000000003',
   '电子制造', '/images/solutions/electronics.jpg',
   'PCB 板缺陷检测与元器件贴装精度验证方案。通过 3D 视觉系统检测焊点缺陷、元器件偏移与缺失，配合传感器实时监控产线温湿度，确保电子制造品质稳定。',
   '["b1b2c3d4-0001-4000-8000-000000000003","b1b2c3d4-0001-4000-8000-000000000006","b1b2c3d4-0001-4000-8000-000000000007"]', 3);
