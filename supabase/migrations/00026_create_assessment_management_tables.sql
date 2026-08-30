-- 创建测评模板表
CREATE TABLE IF NOT EXISTS assessment_templates (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  template_name TEXT NOT NULL,
  applicable_positions TEXT[] DEFAULT '{}',
  questions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建测评任务表
CREATE TABLE IF NOT EXISTS assessment_tasks (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  template_id BIGINT REFERENCES assessment_templates(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  target_position TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused', 'ended')),
  link TEXT,
  participants_count INT DEFAULT 0,
  completed_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建测评结果表
CREATE TABLE IF NOT EXISTS assessment_results (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT REFERENCES assessment_tasks(id) ON DELETE CASCADE,
  user_id BIGINT,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_phone TEXT,
  total_score NUMERIC(5,2) DEFAULT 0,
  dimension_scores JSONB DEFAULT '{}',
  answers JSONB DEFAULT '[]',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_assessment_templates_company ON assessment_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_tasks_company ON assessment_tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_tasks_template ON assessment_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_task ON assessment_results(task_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_user ON assessment_results(user_id);

-- 插入示例测评模板数据（基于冰山模型）
INSERT INTO assessment_templates (company_id, template_name, applicable_positions, questions, status) VALUES
(1, '综合能力测评模板', ARRAY['全部岗位'], '[
  {
    "id": 1,
    "category": "知识技能",
    "dimension": "专业知识",
    "question": "请描述您在本专业领域的核心技能和知识储备",
    "type": "text",
    "weight": 10
  },
  {
    "id": 2,
    "category": "知识技能",
    "dimension": "工具使用",
    "question": "您熟练掌握哪些专业工具或软件？",
    "type": "multiple",
    "options": ["Office办公软件", "编程语言", "设计工具", "数据分析工具", "项目管理工具"],
    "weight": 10
  },
  {
    "id": 3,
    "category": "能力素质",
    "dimension": "沟通能力",
    "question": "在团队协作中，您如何确保信息有效传达？",
    "type": "text",
    "weight": 15
  },
  {
    "id": 4,
    "category": "能力素质",
    "dimension": "问题解决",
    "question": "请举例说明您如何解决工作中遇到的复杂问题",
    "type": "text",
    "weight": 15
  },
  {
    "id": 5,
    "category": "价值观",
    "dimension": "职业态度",
    "question": "您认为在工作中最重要的价值观是什么？",
    "type": "single",
    "options": ["诚信", "责任", "创新", "团队", "效率"],
    "weight": 15
  },
  {
    "id": 6,
    "category": "价值观",
    "dimension": "职业发展",
    "question": "您对未来3-5年的职业发展有什么规划？",
    "type": "text",
    "weight": 15
  },
  {
    "id": 7,
    "category": "动机驱动",
    "dimension": "工作动力",
    "question": "什么因素最能激励您在工作中保持高效？",
    "type": "single",
    "options": ["薪资回报", "成就感", "学习成长", "团队氛围", "社会认可"],
    "weight": 10
  },
  {
    "id": 8,
    "category": "动机驱动",
    "dimension": "职业兴趣",
    "question": "您最感兴趣的工作内容类型是？",
    "type": "multiple",
    "options": ["技术研发", "项目管理", "团队协作", "创新设计", "数据分析"],
    "weight": 10
  }
]'::jsonb, 'active'),
(1, '技术岗位测评模板', ARRAY['前端工程师', '后端工程师', '算法工程师'], '[
  {
    "id": 1,
    "category": "知识技能",
    "dimension": "编程能力",
    "question": "请描述您最擅长的编程语言和技术栈",
    "type": "text",
    "weight": 20
  },
  {
    "id": 2,
    "category": "知识技能",
    "dimension": "项目经验",
    "question": "请分享您参与过的最有挑战性的技术项目",
    "type": "text",
    "weight": 20
  },
  {
    "id": 3,
    "category": "能力素质",
    "dimension": "学习能力",
    "question": "您如何快速学习和掌握新技术？",
    "type": "text",
    "weight": 15
  },
  {
    "id": 4,
    "category": "能力素质",
    "dimension": "问题分析",
    "question": "面对技术难题，您的解决思路是什么？",
    "type": "text",
    "weight": 15
  },
  {
    "id": 5,
    "category": "价值观",
    "dimension": "技术追求",
    "question": "您认为优秀的技术人员应该具备哪些品质？",
    "type": "text",
    "weight": 15
  },
  {
    "id": 6,
    "category": "动机驱动",
    "dimension": "技术热情",
    "question": "是什么驱使您持续学习和提升技术能力？",
    "type": "text",
    "weight": 15
  }
]'::jsonb, 'active'),
(1, '管理岗位测评模板', ARRAY['项目经理', '产品经理', '团队主管'], '[
  {
    "id": 1,
    "category": "知识技能",
    "dimension": "管理知识",
    "question": "请描述您的管理经验和管理理念",
    "type": "text",
    "weight": 15
  },
  {
    "id": 2,
    "category": "能力素质",
    "dimension": "领导力",
    "question": "您如何激励团队成员达成目标？",
    "type": "text",
    "weight": 20
  },
  {
    "id": 3,
    "category": "能力素质",
    "dimension": "决策能力",
    "question": "请举例说明您如何在压力下做出关键决策",
    "type": "text",
    "weight": 20
  },
  {
    "id": 4,
    "category": "能力素质",
    "dimension": "冲突处理",
    "question": "面对团队冲突，您会采取什么措施？",
    "type": "text",
    "weight": 15
  },
  {
    "id": 5,
    "category": "价值观",
    "dimension": "管理理念",
    "question": "您认为优秀管理者最重要的特质是什么？",
    "type": "text",
    "weight": 15
  },
  {
    "id": 6,
    "category": "动机驱动",
    "dimension": "管理动力",
    "question": "是什么促使您选择管理岗位？",
    "type": "text",
    "weight": 15
  }
]'::jsonb, 'active');

-- 插入示例测评任务数据
INSERT INTO assessment_tasks (company_id, template_id, task_name, deadline, target_position, status, link, participants_count, completed_count) VALUES
(1, 1, '2026年春季校招综合测评', '2026-04-30 23:59:59', '全部岗位', 'published', 'https://platform.com/assessment/task-001', 156, 89),
(1, 2, '技术岗位能力测评', '2026-03-31 23:59:59', '前端工程师', 'published', 'https://platform.com/assessment/task-002', 45, 38),
(1, 3, '管理培训生选拔测评', '2026-05-15 23:59:59', '项目经理', 'published', 'https://platform.com/assessment/task-003', 28, 12),
(1, 1, '实习生综合能力测评', '2026-06-30 23:59:59', '全部岗位', 'draft', 'https://platform.com/assessment/task-004', 0, 0);

-- 插入示例测评结果数据
INSERT INTO assessment_results (task_id, user_id, user_name, user_email, user_phone, total_score, dimension_scores, status, completed_at) VALUES
(1, 1001, '张三', 'zhangsan@example.com', '138****1234', 88.5, '{"知识技能": 85, "能力素质": 90, "价值观": 88, "动机驱动": 91}'::jsonb, 'completed', '2026-03-10 14:30:00'),
(1, 1002, '李四', 'lisi@example.com', '139****5678', 92.0, '{"知识技能": 95, "能力素质": 90, "价值观": 92, "动机驱动": 91}'::jsonb, 'completed', '2026-03-11 09:15:00'),
(1, 1003, '王五', 'wangwu@example.com', '136****9012', 78.5, '{"知识技能": 75, "能力素质": 80, "价值观": 78, "动机驱动": 81}'::jsonb, 'completed', '2026-03-11 16:45:00'),
(2, 1004, '赵六', 'zhaoliu@example.com', '137****3456', 85.0, '{"知识技能": 88, "能力素质": 82, "价值观": 85, "动机驱动": 85}'::jsonb, 'completed', '2026-03-12 10:20:00'),
(2, 1005, '孙七', 'sunqi@example.com', '135****7890', 90.5, '{"知识技能": 92, "能力素质": 89, "价值观": 91, "动机驱动": 90}'::jsonb, 'completed', '2026-03-12 11:30:00'),
(3, 1006, '周八', 'zhouba@example.com', '134****2345', 82.0, '{"知识技能": 80, "能力素质": 85, "价值观": 82, "动机驱动": 81}'::jsonb, 'completed', '2026-03-13 15:00:00');