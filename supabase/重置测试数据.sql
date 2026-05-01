-- =============================================
-- 重置测试数据
-- 清空所有表数据后插入测试数据
-- 在 Supabase SQL Editor 中执行
-- =============================================

-- 1. 关闭 RLS（新项目默认开启，anon 角色无法读取数据）
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE solutions DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_attachments DISABLE ROW LEVEL SECURITY;

-- 2. 清空所有表数据（保留表结构）
TRUNCATE TABLE product_attachments CASCADE;
TRUNCATE TABLE solutions CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE product_categories CASCADE;

-- 2. 产品大类
INSERT INTO product_categories (id, name, image_url, sort_order) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', '智能传感器', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', 1),
  ('a1b2c3d4-0001-4000-8000-000000000002', '工业机器人', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop', 2),
  ('a1b2c3d4-0001-4000-8000-000000000003', '视觉检测系统', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 3);

-- 3. 智能传感器下的产品
INSERT INTO products (id, category_id, name, model, description, image_urls, main_image_url, summary_content, specifications_content, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001',
   '高精度激光测距传感器', 'LS-1000',
   '测量范围 0.1-50m，精度 ±1mm',
   ARRAY[
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1581091226825-a6a2a83a863c?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop'
   ],
   'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
   '<h3>产品概述</h3><p>LS-1000 是一款高精度激光测距传感器，适用于工业自动化距离测量与定位场景。采用相位式激光测距技术，具备高精度、远量程、快速响应等特点。</p><h3>核心优势</h3><ul><li>高精度：±1mm 测量精度</li><li>远量程：0.1-50m 测量范围</li><li>快速响应：<5ms 响应时间</li><li>多协议：支持 RS485/Modbus</li></ul>',
   '<table border="1" cellpadding="6"><tr><th>参数</th><th>规格</th></tr><tr><td>测量范围</td><td>0.1 - 50m</td></tr><tr><td>测量精度</td><td>±1mm</td></tr><tr><td>响应时间</td><td>&lt;5ms</td></tr><tr><td>通信协议</td><td>RS485/Modbus</td></tr><tr><td>工作电压</td><td>12-24V DC</td></tr><tr><td>防护等级</td><td>IP65</td></tr><tr><td>工作温度</td><td>-20°C ~ +60°C</td></tr></table>',
   1),

  ('b1b2c3d4-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001',
   '工业级温度传感器', 'TS-2000',
   '测温范围 -40°C 到 125°C',
   ARRAY[
     'https://images.unsplash.com/photo-1581091226825-a6a2a83a863c?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'
   ],
   'https://images.unsplash.com/photo-1581091226825-a6a2a83a863c?w=600&h=600&fit=crop',
   '<h3>产品概述</h3><p>TS-2000 工业级温度传感器，适用于恶劣工业环境下的温度监测。IP67 防护等级，4-20mA 模拟输出，安装便捷。</p><h3>核心优势</h3><ul><li>宽温区：-40°C 到 125°C</li><li>高防护：IP67 防护等级</li><li>标准输出：4-20mA 模拟信号</li></ul>',
   '<table border="1" cellpadding="6"><tr><th>参数</th><th>规格</th></tr><tr><td>测温范围</td><td>-40°C ~ +125°C</td></tr><tr><td>精度</td><td>±0.5°C</td></tr><tr><td>输出信号</td><td>4-20mA</td></tr><tr><td>防护等级</td><td>IP67</td></tr><tr><td>供电电压</td><td>12-36V DC</td></tr></table>',
   2),

  ('b1b2c3d4-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001',
   '多轴加速度传感器', 'AS-3000',
   '6 轴加速度 + 陀螺仪',
   ARRAY[
     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1581091226825-a6a2a83a863c?w=600&h=600&fit=crop'
   ],
   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop',
   '<h3>产品概述</h3><p>AS-3000 是一款 6 轴高精度 IMU 模块，集成三轴加速度计和三轴陀螺仪，适用于振动监测与姿态检测场景。</p>',
   '<table border="1" cellpadding="6"><tr><th>参数</th><th>规格</th></tr><tr><td>加速度量程</td><td>±16g</td></tr><tr><td>陀螺仪量程</td><td>±2000°/s</td></tr><tr><td>接口</td><td>SPI/I2C</td></tr><tr><td>采样率</td><td>高达 8kHz</td></tr></table>',
   3);

-- 4. 工业机器人下的产品
INSERT INTO products (id, category_id, name, model, description, image_urls, main_image_url, summary_content, specifications_content, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000002',
   '六轴协作机器人', 'CR-600',
   '负载 6kg，臂展 900mm',
   ARRAY[
     'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1561557944-6e7876e5c7cf?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'
   ],
   'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=600&fit=crop',
   '<h3>产品概述</h3><p>CR-600 六轴协作机器人，重复定位精度 ±0.02mm，支持拖拽示教与图形化编程，适用于柔性产线。</p><h3>核心优势</h3><ul><li>高精度：±0.02mm 重复定位</li><li>易用性：拖拽示教 + 图形编程</li><li>安全性：力矩传感器碰撞检测</li></ul>',
   '<table border="1" cellpadding="6"><tr><th>参数</th><th>规格</th></tr><tr><td>负载</td><td>6kg</td></tr><tr><td>臂展</td><td>900mm</td></tr><tr><td>重复定位精度</td><td>±0.02mm</td></tr><tr><td>轴数</td><td>6</td></tr><tr><td>防护等级</td><td>IP54</td></tr></table>',
   1),

  ('b1b2c3d4-0001-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000002',
   'SCARA 高速分拣机器人', 'SR-400',
   '负载 3kg，循环时间 0.4s',
   ARRAY[
     'https://images.unsplash.com/photo-1561557944-6e7876e5c7cf?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=600&fit=crop'
   ],
   'https://images.unsplash.com/photo-1561557944-6e7876e5c7cf?w=600&h=600&fit=crop',
   '<h3>产品概述</h3><p>SR-400 SCARA 高速分拣机器人，循环时间 0.4s，适用于电子元器件高速分拣与装配，支持视觉引导。</p>',
   '<table border="1" cellpadding="6"><tr><th>参数</th><th>规格</th></tr><tr><td>负载</td><td>3kg</td></tr><tr><td>循环时间</td><td>0.4s</td></tr><tr><td>重复定位精度</td><td>±0.01mm</td></tr><tr><td>视觉引导</td><td>支持</td></tr></table>',
   2);

-- 5. 视觉检测系统下的产品
INSERT INTO products (id, category_id, name, model, description, image_urls, main_image_url, summary_content, specifications_content, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000006', 'a1b2c3d4-0001-4000-8000-000000000003',
   '工业 3D 视觉检测系统', 'VS-8000',
   '千万级像素 3D 相机',
   ARRAY[
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop'
   ],
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop',
   '<h3>产品概述</h3><p>VS-8000 工业 3D 视觉检测系统，千万级像素 3D 相机，集成深度学习算法，适用于表面缺陷检测与尺寸测量。</p>',
   '<table border="1" cellpadding="6"><tr><th>参数</th><th>规格</th></tr><tr><td>分辨率</td><td>1200万像素</td></tr><tr><td>检测精度</td><td>0.01mm</td></tr><tr><td>算法</td><td>深度学习</td></tr><tr><td>接口</td><td>GigE Vision</td></tr></table>',
   1),

  ('b1b2c3d4-0001-4000-8000-000000000007', 'a1b2c3d4-0001-4000-8000-000000000003',
   '智能 barcode/QR 读码器', 'BC-500',
   '高速一维/二维条码读取',
   ARRAY[
     'https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=600&h=600&fit=crop',
     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=600&fit=crop'
   ],
   'https://images.unsplash.com/photo-1586953208270-767889fa9b0e?w=600&h=600&fit=crop',
   '<h3>产品概述</h3><p>BC-500 智能读码器，高速一维/二维条码读取，读取速度 >60 次/秒，适用于产线追溯与物流分拣。</p>',
   '<table border="1" cellpadding="6"><tr><th>参数</th><th>规格</th></tr><tr><td>读取速度</td><td>&gt;60次/秒</td></tr><tr><td>码制</td><td>一维/二维</td></tr><tr><td>防护等级</td><td>IP65</td></tr><tr><td>接口</td><td>RS232/Ethernet</td></tr></table>',
   2);

-- 6. 产品附件
INSERT INTO product_attachments (product_id, file_name, file_url, file_type, file_size, sort_order) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'LS-1000 产品手册.pdf', 'https://example.com/docs/ls1000-manual.pdf', 'manual', 2048000, 1),
  ('b1b2c3d4-0001-4000-8000-000000000001', 'CE 认证证书.pdf', 'https://example.com/docs/ls1000-ce.pdf', 'certificate', 512000, 2),
  ('b1b2c3d4-0001-4000-8000-000000000004', 'CR-600 产品手册.pdf', 'https://example.com/docs/cr600-manual.pdf', 'manual', 3072000, 1),
  ('b1b2c3d4-0001-4000-8000-000000000004', 'ISO 9001 证书.pdf', 'https://example.com/docs/cr600-iso.pdf', 'certificate', 256000, 2),
  ('b1b2c3d4-0001-4000-8000-000000000004', 'CAD 模型文件.zip', 'https://example.com/docs/cr600-cad.zip', 'other', 10240000, 3);

-- 7. 解决方案
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

-- 8. 刷新 PostgREST schema cache
NOTIFY pgrst, 'reload schema';
