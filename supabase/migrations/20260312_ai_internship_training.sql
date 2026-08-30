-- AI个性化岗位实习培养系统数据库表

-- 1. 能力画像表
create table if not exists ability_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- 技术能力维度（10个）
  programming_ability integer default 0, -- 编程能力
  data_analysis_ability integer default 0, -- 数据分析能力
  design_ability integer default 0, -- 设计能力
  writing_ability integer default 0, -- 写作能力
  marketing_ability integer default 0, -- 营销能力
  operations_ability integer default 0, -- 运营能力
  product_ability integer default 0, -- 产品能力
  project_management_ability integer default 0, -- 项目管理能力
  technical_support_ability integer default 0, -- 技术支持能力
  research_ability integer default 0, -- 研究能力
  
  -- 软技能维度（10个）
  communication_ability integer default 0, -- 沟通表达能力
  teamwork_ability integer default 0, -- 团队协作能力
  leadership_ability integer default 0, -- 领导力
  problem_solving_ability integer default 0, -- 问题解决能力
  learning_ability integer default 0, -- 学习能力
  innovation_ability integer default 0, -- 创新能力
  time_management_ability integer default 0, -- 时间管理能力
  stress_resistance_ability integer default 0, -- 抗压能力
  adaptability integer default 0, -- 适应能力
  execution_ability integer default 0, -- 执行力
  
  -- 行业知识维度（10个）
  internet_knowledge integer default 0, -- 互联网行业知识
  finance_knowledge integer default 0, -- 金融行业知识
  education_knowledge integer default 0, -- 教育行业知识
  healthcare_knowledge integer default 0, -- 医疗行业知识
  manufacturing_knowledge integer default 0, -- 制造业知识
  retail_knowledge integer default 0, -- 零售行业知识
  media_knowledge integer default 0, -- 媒体行业知识
  consulting_knowledge integer default 0, -- 咨询行业知识
  government_knowledge integer default 0, -- 政府/公共部门知识
  startup_knowledge integer default 0, -- 创业/初创企业知识
  
  -- 综合评分
  overall_score integer default 0, -- 综合评分（0-100）
  
  -- 数据来源
  data_sources jsonb default '[]'::jsonb, -- 数据来源列表
  
  -- 元数据
  last_analyzed_at timestamptz, -- 最后分析时间
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. 实习路径表
create table if not exists internship_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- 目标岗位
  target_position text not null, -- 目标岗位名称
  target_industry text, -- 目标行业
  
  -- 路径信息
  path_stages jsonb not null, -- 路径阶段列表
  -- [{
  --   stage: number,
  --   name: string,
  --   description: string,
  --   tasks: string[],
  --   estimatedDuration: string,
  --   requiredAbilities: string[]
  -- }]
  
  current_stage integer default 1, -- 当前阶段
  completion_rate integer default 0, -- 完成率（%）
  
  -- 能力缺口
  ability_gaps jsonb default '[]'::jsonb, -- 能力缺口列表
  -- [{
  --   ability: string,
  --   currentLevel: number,
  --   targetLevel: number,
  --   priority: string
  -- }]
  
  -- 学习建议
  learning_suggestions jsonb default '[]'::jsonb, -- 学习建议
  
  -- 状态
  status text default 'active', -- active, paused, completed
  
  -- 元数据
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 实训任务表
create table if not exists training_tasks (
  id uuid primary key default gen_random_uuid(),
  
  -- 任务基本信息
  title text not null, -- 任务标题
  description text not null, -- 任务描述
  task_type text not null, -- 任务类型：virtual_training, case_analysis, project_practice, skill_exercise
  
  -- 岗位关联
  related_positions jsonb default '[]'::jsonb, -- 关联岗位列表
  related_industries jsonb default '[]'::jsonb, -- 关联行业列表
  
  -- 难度和要求
  difficulty_level text not null, -- 难度：beginner, intermediate, advanced, expert
  estimated_duration integer, -- 预计完成时长（分钟）
  required_abilities jsonb default '[]'::jsonb, -- 所需能力
  
  -- 任务内容
  task_content jsonb not null, -- 任务内容
  -- {
  --   scenario: string,
  --   objectives: string[],
  --   steps: string[],
  --   resources: string[],
  --   deliverables: string[]
  -- }
  
  -- 评分标准
  evaluation_criteria jsonb not null, -- 评分标准
  -- [{
  --   dimension: string,
  --   weight: number,
  --   description: string
  -- }]
  
  -- 参考答案
  reference_solution text, -- 参考答案/优秀案例
  
  -- 标签
  tags jsonb default '[]'::jsonb, -- 标签
  
  -- 元数据
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. 学习记录表
create table if not exists learning_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references training_tasks(id) on delete cascade not null,
  path_id uuid references internship_paths(id) on delete set null,
  
  -- 任务执行
  started_at timestamptz default now(),
  completed_at timestamptz,
  time_spent integer, -- 花费时间（秒）
  
  -- 提交内容
  submission_content text, -- 提交内容
  submission_files jsonb default '[]'::jsonb, -- 提交文件
  
  -- AI评估结果
  evaluation_result jsonb, -- 评估结果
  -- {
  --   overallScore: number,
  --   dimensionScores: {...},
  --   strengths: string[],
  --   weaknesses: string[],
  --   suggestions: string[],
  --   comparisonWithBest: string
  -- }
  
  -- 能力提升
  ability_improvements jsonb default '[]'::jsonb, -- 能力提升记录
  -- [{
  --   ability: string,
  --   beforeScore: number,
  --   afterScore: number,
  --   improvement: number
  -- }]
  
  -- 用户反馈
  user_rating integer, -- 用户评分（1-5）
  user_feedback text, -- 用户反馈
  
  -- 状态
  status text default 'in_progress', -- in_progress, submitted, evaluated
  
  -- 元数据
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 创建索引
create index if not exists idx_ability_profiles_user_id on ability_profiles(user_id);
create index if not exists idx_internship_paths_user_id on internship_paths(user_id);
create index if not exists idx_internship_paths_status on internship_paths(status);
create index if not exists idx_training_tasks_type on training_tasks(task_type);
create index if not exists idx_training_tasks_difficulty on training_tasks(difficulty_level);
create index if not exists idx_learning_records_user_id on learning_records(user_id);
create index if not exists idx_learning_records_task_id on learning_records(task_id);
create index if not exists idx_learning_records_status on learning_records(status);

-- RLS策略
alter table ability_profiles enable row level security;
alter table internship_paths enable row level security;
alter table training_tasks enable row level security;
alter table learning_records enable row level security;

-- 能力画像表策略
create policy "用户可以查看自己的能力画像"
  on ability_profiles for select
  using (auth.uid() = user_id);

create policy "用户可以创建自己的能力画像"
  on ability_profiles for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的能力画像"
  on ability_profiles for update
  using (auth.uid() = user_id);

-- 实习路径表策略
create policy "用户可以查看自己的实习路径"
  on internship_paths for select
  using (auth.uid() = user_id);

create policy "用户可以创建自己的实习路径"
  on internship_paths for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的实习路径"
  on internship_paths for update
  using (auth.uid() = user_id);

-- 实训任务表策略（所有人可查看）
create policy "所有人可以查看实训任务"
  on training_tasks for select
  using (is_active = true);

-- 学习记录表策略
create policy "用户可以查看自己的学习记录"
  on learning_records for select
  using (auth.uid() = user_id);

create policy "用户可以创建学习记录"
  on learning_records for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的学习记录"
  on learning_records for update
  using (auth.uid() = user_id);
