-- 创建测评岗位表
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  participant_count INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_assessments_category ON assessments(category);
CREATE INDEX IF NOT EXISTS idx_assessments_difficulty ON assessments(difficulty_level);

-- 添加RLS策略
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 所有人都可以查看测评岗位
CREATE POLICY "Anyone can view assessments"
  ON assessments
  FOR SELECT
  USING (true);

-- 插入20+个岗位数据
INSERT INTO assessments (position_name, category, description, duration_minutes, difficulty_level, participant_count, icon) VALUES
-- 技术开发类
('前端开发工程师', '技术开发', '负责Web前端开发，精通React/Vue等框架，具备良好的UI/UX实现能力', 45, 'medium', 1523, '💻'),
('后端开发工程师', '技术开发', '负责服务端开发，精通Java/Python/Go等语言，熟悉微服务架构', 50, 'medium', 1876, '⚙️'),
('全栈开发工程师', '技术开发', '同时具备前后端开发能力，能够独立完成完整项目开发', 60, 'hard', 982, '🔧'),
('移动端开发工程师', '技术开发', '负责iOS/Android应用开发，熟悉Flutter/React Native等跨平台框架', 45, 'medium', 756, '📱'),
('测试开发工程师', '技术开发', '负责自动化测试框架搭建，编写测试用例，保障产品质量', 40, 'medium', 543, '🧪'),
('运维开发工程师', '技术开发', '负责系统运维自动化，熟悉Docker/K8s，具备DevOps实践经验', 45, 'medium', 432, '🔐'),

-- AI与数据类
('AI模型工程师', 'AI与数据', '负责深度学习模型训练与优化，精通PyTorch/TensorFlow框架', 50, 'hard', 2341, '🤖'),
('机器学习工程师', 'AI与数据', '负责机器学习算法研发与应用，具备扎实的数学统计基础', 50, 'hard', 1654, '🧠'),
('数据分析师', 'AI与数据', '负责数据挖掘与分析，熟练使用SQL/Python进行数据处理', 40, 'medium', 1234, '📊'),
('算法工程师', 'AI与数据', '负责推荐/搜索/NLP等算法研发，具备大规模数据处理经验', 55, 'hard', 987, '🔬'),
('大数据工程师', 'AI与数据', '负责大数据平台搭建与维护，熟悉Hadoop/Spark生态', 45, 'medium', 765, '💾'),

-- 产品运营类
('产品经理', '产品运营', '负责产品规划与需求分析，具备良好的用户洞察与沟通能力', 40, 'medium', 2156, '📋'),
('产品运营', '产品运营', '负责产品推广与用户增长，熟悉数据分析与运营策略', 35, 'easy', 1543, '📈'),
('用户增长专员', '产品运营', '负责用户拉新与留存，精通增长黑客方法论', 35, 'medium', 876, '🚀'),
('内容运营', '产品运营', '负责内容策划与创作，具备优秀的文案能力和创意思维', 30, 'easy', 1234, '✍️'),
('社区运营', '产品运营', '负责社区氛围营造与用户互动，具备良好的沟通协调能力', 30, 'easy', 654, '👥'),

-- 设计类
('UI设计师', '设计', '负责界面视觉设计，精通Figma/Sketch等设计工具', 40, 'medium', 1432, '🎨'),
('UX设计师', '设计', '负责用户体验设计，具备用户研究与交互设计能力', 45, 'medium', 876, '🖌️'),
('视觉设计师', '设计', '负责品牌视觉设计，具备优秀的审美能力和创意表达', 40, 'medium', 543, '🌈'),

-- 智能制造类
('工业互联网工程师', '智能制造', '负责工业设备联网与数据采集，熟悉工业协议与边缘计算', 45, 'medium', 432, '🏭'),
('智能制造工程师', '智能制造', '负责生产线智能化改造，具备自动化控制与优化经验', 50, 'hard', 321, '⚡'),
('数字孪生工程师', '智能制造', '负责数字孪生系统搭建，熟悉3D建模与仿真技术', 50, 'hard', 234, '🔮'),

-- 新兴岗位
('区块链工程师', '新兴技术', '负责区块链应用开发，熟悉智能合约与分布式系统', 50, 'hard', 456, '⛓️'),
('云计算工程师', '新兴技术', '负责云平台架构设计，熟悉AWS/Azure/阿里云等云服务', 45, 'medium', 678, '☁️'),
('网络安全工程师', '新兴技术', '负责系统安全防护，具备渗透测试与安全加固经验', 50, 'hard', 543, '🛡️'),
('游戏开发工程师', '新兴技术', '负责游戏开发与优化，熟悉Unity/Unreal等游戏引擎', 50, 'medium', 765, '🎮');