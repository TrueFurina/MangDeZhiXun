// 115个标准完整列表
export interface PositionData {
  position_name: string;
  category: string;
  description: string;
  duration_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  question_bank_key: string; // 对应的题库key
}

export const allPositions: PositionData[] = [
  // ==================== 技术开发类（35个）====================
  // 前端方向（8个）
  { position_name: '前端开发工程师', category: '技术开发', description: '负责Web前端开发，使用React/Vue等框架构建用户界面', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'frontend' },
  { position_name: '高级前端开发工程师', category: '技术开发', description: '负责复杂前端架构设计和性能优化', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'frontend' },
  { position_name: '前端架构师', category: '技术开发', description: '负责前端技术选型、架构设计和团队技术规范', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'frontend_architect' },
  { position_name: 'Web前端工程师', category: '技术开发', description: '开发响应式Web应用，注重用户体验', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'frontend' },
  { position_name: 'H5开发工程师', category: '技术开发', description: '专注移动端H5页面开发和优化', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'frontend' },
  { position_name: 'React开发工程师', category: '技术开发', description: '精通React生态，开发高性能Web应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'frontend' },
  { position_name: 'Vue开发工程师', category: '技术开发', description: '精通Vue生态，开发企业级前端应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'frontend' },
  { position_name: '小程序开发工程师', category: '技术开发', description: '开发微信、支付宝等小程序应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'frontend' },
  
  // 后端方向（10个）
  { position_name: '后端开发工程师', category: '技术开发', description: '负责服务端开发，设计和实现业务逻辑', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'backend' },
  { position_name: '高级后端开发工程师', category: '技术开发', description: '负责复杂业务系统设计和高并发优化', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'backend' },
  { position_name: '后端架构师', category: '技术开发', description: '负责后端架构设计、技术选型和系统优化', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'backend_architect' },
  { position_name: 'Java开发工程师', category: '技术开发', description: '使用Java技术栈开发企业级应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'backend' },
  { position_name: 'Python开发工程师', category: '技术开发', description: '使用Python开发Web应用和数据处理系统', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'backend' },
  { position_name: 'Go开发工程师', category: '技术开发', description: '使用Go语言开发高性能后端服务', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'backend' },
  { position_name: 'Node.js开发工程师', category: '技术开发', description: '使用Node.js开发高并发服务端应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'backend' },
  { position_name: 'PHP开发工程师', category: '技术开发', description: '使用PHP开发Web应用和API服务', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'backend' },
  { position_name: 'C++开发工程师', category: '技术开发', description: '使用C++开发高性能系统和底层服务', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'backend' },
  { position_name: '.NET开发工程师', category: '技术开发', description: '使用.NET技术栈开发企业应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'backend' },
  
  // 全栈与移动端（7个）
  { position_name: '全栈开发工程师', category: '技术开发', description: '同时负责前端和后端开发，独立完成项目', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'fullstack' },
  { position_name: '高级全栈工程师', category: '技术开发', description: '精通前后端技术，能够架构完整系统', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'fullstack' },
  { position_name: '移动端开发工程师', category: '技术开发', description: '开发iOS/Android原生或跨平台移动应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'mobile' },
  { position_name: 'iOS开发工程师', category: '技术开发', description: '使用Swift/Objective-C开发iOS应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'mobile' },
  { position_name: 'Android开发工程师', category: '技术开发', description: '使用Kotlin/Java开发Android应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'mobile' },
  { position_name: 'Flutter开发工程师', category: '技术开发', description: '使用Flutter开发跨平台移动应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'mobile' },
  { position_name: 'React Native开发工程师', category: '技术开发', description: '使用React Native开发跨平台应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'mobile' },
  
  // 测试与运维（10个）
  { position_name: '测试开发工程师', category: '技术开发', description: '开发自动化测试工具，保障产品质量', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'test' },
  { position_name: '高级测试工程师', category: '技术开发', description: '负责测试策略设计和质量体系建设', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'test' },
  { position_name: '自动化测试工程师', category: '技术开发', description: '设计和实现自动化测试框架', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'test' },
  { position_name: '性能测试工程师', category: '技术开发', description: '负责系统性能测试和优化建议', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'test' },
  { position_name: '运维开发工程师', category: '技术开发', description: '负责系统运维和自动化工具开发', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'devops' },
  { position_name: 'DevOps工程师', category: '技术开发', description: '负责CI/CD流程和基础设施自动化', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'devops' },
  { position_name: 'SRE工程师', category: '技术开发', description: '负责系统可靠性工程和稳定性保障', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'devops' },
  { position_name: '运维工程师', category: '技术开发', description: '负责服务器运维和系统监控', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'devops' },
  { position_name: '系统工程师', category: '技术开发', description: '负责系统架构和基础设施管理', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'devops' },
  { position_name: '网络工程师', category: '技术开发', description: '负责网络架构设计和网络安全', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'devops' },

  // ==================== AI与数据类（20个）====================
  { position_name: 'AI模型工程师', category: 'AI与数据', description: '开发和优化AI模型，应用于实际业务场景', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'ai' },
  { position_name: 'AI算法工程师', category: 'AI与数据', description: '研究和实现AI算法，解决复杂问题', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'algorithm' },
  { position_name: '算法工程师', category: 'AI与数据', description: '设计和优化算法，提升系统性能', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'algorithm' },
  { position_name: '机器学习工程师', category: 'AI与数据', description: '构建机器学习系统，实现模型部署', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'ml' },
  { position_name: '深度学习工程师', category: 'AI与数据', description: '开发深度学习模型，应用于图像、语音等领域', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'ml' },
  { position_name: 'NLP算法工程师', category: 'AI与数据', description: '专注自然语言处理，开发文本理解系统', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'nlp' },
  { position_name: '计算机视觉工程师', category: 'AI与数据', description: '开发图像识别和视觉理解系统', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'cv' },
  { position_name: '推荐算法工程师', category: 'AI与数据', description: '设计推荐系统，提升用户体验', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'algorithm' },
  { position_name: '搜索算法工程师', category: 'AI与数据', description: '优化搜索算法，提升搜索质量', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'algorithm' },
  { position_name: '大数据工程师', category: 'AI与数据', description: '构建大数据处理平台，处理海量数据', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'bigdata' },
  { position_name: '数据开发工程师', category: 'AI与数据', description: '开发数据处理流程，构建数据仓库', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'bigdata' },
  { position_name: '数据分析师', category: 'AI与数据', description: '分析业务数据，提供数据洞察', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'data_analyst' },
  { position_name: '数据科学家', category: 'AI与数据', description: '结合统计学和机器学习，解决业务问题', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'data_scientist' },
  { position_name: '数据挖掘工程师', category: 'AI与数据', description: '从数据中挖掘价值，发现业务规律', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'data_scientist' },
  { position_name: 'BI工程师', category: 'AI与数据', description: '构建商业智能系统，支持数据决策', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'data_analyst' },
  { position_name: '数据仓库工程师', category: 'AI与数据', description: '设计和维护数据仓库，支持数据分析', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'bigdata' },
  { position_name: 'ETL工程师', category: 'AI与数据', description: '开发数据抽取、转换和加载流程', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'bigdata' },
  { position_name: '数据架构师', category: 'AI与数据', description: '设计企业级数据架构和数据治理体系', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'data_architect' },
  { position_name: 'AI产品经理', category: 'AI与数据', description: '负责AI产品规划和落地', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ai_pm' },
  { position_name: 'AI应用工程师', category: 'AI与数据', description: '将AI技术应用到实际产品中', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ai' },

  // ==================== 产品运营类（20个）====================
  { position_name: '产品经理', category: '产品运营', description: '负责产品规划、需求分析和产品迭代', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'pm' },
  { position_name: '高级产品经理', category: '产品运营', description: '负责复杂产品设计和产品战略规划', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'pm' },
  { position_name: '产品总监', category: '产品运营', description: '负责产品线管理和团队建设', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'pm' },
  { position_name: 'B端产品经理', category: '产品运营', description: '负责企业级产品设计和客户需求管理', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'pm' },
  { position_name: 'C端产品经理', category: '产品运营', description: '负责消费级产品设计和用户体验优化', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'pm' },
  { position_name: '产品运营', category: '产品运营', description: '负责产品推广和用户增长', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'product_ops' },
  { position_name: '用户运营', category: '产品运营', description: '负责用户生命周期管理和用户活跃', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'user_ops' },
  { position_name: '内容运营', category: '产品运营', description: '负责内容策划和内容生态建设', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'content_ops' },
  { position_name: '活动运营', category: '产品运营', description: '策划和执行运营活动，提升用户参与', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'product_ops' },
  { position_name: '社区运营', category: '产品运营', description: '建设和维护用户社区，促进用户互动', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'community_ops' },
  { position_name: '用户增长专员', category: '产品运营', description: '负责用户增长策略和增长实验', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'growth' },
  { position_name: '增长黑客', category: '产品运营', description: '通过数据驱动实现低成本快速增长', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'growth' },
  { position_name: '数据运营', category: '产品运营', description: '通过数据分析优化运营策略', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'data_ops' },
  { position_name: '新媒体运营', category: '产品运营', description: '负责社交媒体运营和品牌传播', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'content_ops' },
  { position_name: '电商运营', category: '产品运营', description: '负责电商平台运营和销售转化', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ecommerce_ops' },
  { position_name: '市场营销专员', category: '产品运营', description: '负责市场推广和品牌营销', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'marketing' },
  { position_name: '品牌经理', category: '产品运营', description: '负责品牌战略和品牌形象管理', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'marketing' },
  { position_name: '商务拓展', category: '产品运营', description: '负责商务合作和渠道拓展', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'bd' },
  { position_name: '客户成功经理', category: '产品运营', description: '负责客户关系维护和客户成功', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'cs' },
  { position_name: '运营总监', category: '产品运营', description: '负责运营体系建设和团队管理', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'product_ops' },

  // ==================== 设计类（15个）====================
  { position_name: 'UI设计师', category: '设计', description: '负责界面视觉设计和设计规范', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ui' },
  { position_name: 'UX设计师', category: '设计', description: '负责用户体验设计和交互流程', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ux' },
  { position_name: 'UI/UX设计师', category: '设计', description: '负责界面和体验的整体设计', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ui' },
  { position_name: '交互设计师', category: '设计', description: '设计产品交互逻辑和用户流程', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ux' },
  { position_name: '视觉设计师', category: '设计', description: '负责品牌视觉和创意设计', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'visual' },
  { position_name: '平面设计师', category: '设计', description: '负责平面广告和宣传物料设计', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'visual' },
  { position_name: '品牌设计师', category: '设计', description: '负责品牌形象和VI设计', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'visual' },
  { position_name: '动效设计师', category: '设计', description: '设计界面动效和交互动画', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ui' },
  { position_name: '插画设计师', category: '设计', description: '创作插画和图形设计', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'visual' },
  { position_name: '3D设计师', category: '设计', description: '创作3D模型和视觉效果', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'visual' },
  { position_name: '用户研究员', category: '设计', description: '进行用户研究和可用性测试', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ux' },
  { position_name: '设计总监', category: '设计', description: '负责设计团队管理和设计战略', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'ui' },
  { position_name: '资深UI设计师', category: '设计', description: '负责复杂产品设计和设计体系建设', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'ui' },
  { position_name: '产品设计师', category: '设计', description: '负责产品全流程设计，从概念到落地', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ui' },
  { position_name: '体验设计师', category: '设计', description: '负责整体用户体验和服务设计', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'ux' },

  // ==================== 管理类（10个）====================
  { position_name: '项目经理', category: '管理', description: '负责项目规划、执行和交付管理', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'project_manager' },
  { position_name: '技术经理', category: '管理', description: '负责技术团队管理和技术决策', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'tech_manager' },
  { position_name: '研发经理', category: '管理', description: '负责研发团队建设和项目管理', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'tech_manager' },
  { position_name: '技术总监', category: '管理', description: '负责技术战略和技术团队管理', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'tech_director' },
  { position_name: 'CTO', category: '管理', description: '负责公司技术战略和技术体系建设', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'cto' },
  { position_name: '架构师', category: '管理', description: '负责系统架构设计和技术选型', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'architect' },
  { position_name: '解决方案架构师', category: '管理', description: '设计企业级解决方案和技术架构', duration_minutes: 90, difficulty_level: 'hard', question_bank_key: 'architect' },
  { position_name: 'Scrum Master', category: '管理', description: '负责敏捷团队管理和流程优化', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'project_manager' },
  { position_name: '敏捷教练', category: '管理', description: '推动敏捷实践和团队转型', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'project_manager' },
  { position_name: 'PMO', category: '管理', description: '负责项目管理体系和流程规范', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'project_manager' },

  // ==================== 新兴技术类（15个）====================
  { position_name: '云计算工程师', category: '新兴技术', description: '负责云平台架构和云服务开发', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'cloud' },
  { position_name: '云原生工程师', category: '新兴技术', description: '开发云原生应用和容器化服务', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'cloud' },
  { position_name: '区块链工程师', category: '新兴技术', description: '开发区块链应用和智能合约', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'blockchain' },
  { position_name: '智能合约工程师', category: '新兴技术', description: '开发和审计智能合约', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'blockchain' },
  { position_name: '物联网工程师', category: '新兴技术', description: '开发物联网系统和嵌入式应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'iot' },
  { position_name: '嵌入式工程师', category: '新兴技术', description: '开发嵌入式系统和硬件驱动', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'iot' },
  { position_name: '网络安全工程师', category: '新兴技术', description: '负责系统安全和安全防护', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'security' },
  { position_name: '安全工程师', category: '新兴技术', description: '进行安全测试和漏洞修复', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'security' },
  { position_name: '游戏开发工程师', category: '新兴技术', description: '开发游戏引擎和游戏逻辑', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'game' },
  { position_name: 'Unity开发工程师', category: '新兴技术', description: '使用Unity开发游戏和3D应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'game' },
  { position_name: '智能制造工程师', category: '新兴技术', description: '负责智能制造系统和工业自动化', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'smart_manufacturing' },
  { position_name: '工业互联网工程师', category: '新兴技术', description: '开发工业互联网平台和应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'smart_manufacturing' },
  { position_name: '数字孪生工程师', category: '新兴技术', description: '构建数字孪生系统和仿真平台', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'smart_manufacturing' },
  { position_name: '元宇宙工程师', category: '新兴技术', description: '开发元宇宙应用和虚拟世界', duration_minutes: 75, difficulty_level: 'hard', question_bank_key: 'metaverse' },
  { position_name: 'AR/VR工程师', category: '新兴技术', description: '开发增强现实和虚拟现实应用', duration_minutes: 60, difficulty_level: 'medium', question_bank_key: 'metaverse' },
];
