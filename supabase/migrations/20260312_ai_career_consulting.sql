-- AI智能就业咨询服务数据库表

-- 1. 求职者画像表
create table if not exists job_seeker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- 基本信息
  name text,
  education_level text, -- 学历水平
  major text, -- 专业
  graduation_year integer, -- 毕业年份
  work_experience_years integer default 0, -- 工作年限
  
  -- 技能画像
  skills jsonb default '[]'::jsonb, -- 技能列表 [{name, level, years}]
  certifications jsonb default '[]'::jsonb, -- 证书列表
  
  -- 职业规划
  career_goal text, -- 职业目标
  target_positions jsonb default '[]'::jsonb, -- 目标岗位列表
  target_industries jsonb default '[]'::jsonb, -- 目标行业列表
  target_cities jsonb default '[]'::jsonb, -- 目标城市列表
  
  -- 期望条件
  expected_salary_min integer, -- 期望薪资下限（千元）
  expected_salary_max integer, -- 期望薪资上限（千元）
  work_type text, -- 工作类型：full_time, part_time, internship, remote
  
  -- 个人特质
  personality_traits jsonb default '[]'::jsonb, -- 性格特质
  strengths jsonb default '[]'::jsonb, -- 优势
  weaknesses jsonb default '[]'::jsonb, -- 待提升项
  
  -- 求职状态
  job_seeking_status text default 'active', -- active, passive, not_seeking
  availability_date date, -- 可入职日期
  
  -- 元数据
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. 就业咨询记录表
create table if not exists career_consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- 咨询内容
  question text not null, -- 用户问题
  question_category text, -- 问题分类：policy, process, skill, career_planning, interview
  
  -- AI回答
  answer text not null, -- AI回答
  answer_quality_score integer, -- 回答质量评分（1-5）
  
  -- 相关信息
  related_keywords jsonb default '[]'::jsonb, -- 相关关键词
  related_resources jsonb default '[]'::jsonb, -- 相关资源链接
  
  -- 用户反馈
  is_helpful boolean, -- 是否有帮助
  user_feedback text, -- 用户反馈
  
  -- 元数据
  created_at timestamptz default now()
);

-- 3. 简历优化记录表
create table if not exists resume_optimizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- 原始简历
  original_resume_text text not null, -- 原始简历文本
  original_resume_url text, -- 原始简历文件URL（如果上传）
  
  -- 目标岗位
  target_position text, -- 目标岗位
  target_industry text, -- 目标行业
  
  -- AI分析结果
  analysis_result jsonb not null, -- 分析结果
  -- {
  --   overallScore: number,
  --   formatIssues: string[],
  --   contentIssues: string[],
  --   missingHighlights: string[],
  --   strengthAreas: string[],
  --   improvementSuggestions: string[]
  -- }
  
  -- 优化建议
  optimization_suggestions jsonb not null, -- 优化建议
  -- {
  --   structureOptimization: string[],
  --   contentOptimization: string[],
  --   keywordOptimization: string[],
  --   languagePolish: string[]
  -- }
  
  -- 优化后简历
  optimized_resume_text text, -- 优化后简历文本
  optimized_resume_url text, -- 优化后简历文件URL
  
  -- 对比数据
  improvement_score integer, -- 改进分数（0-100）
  before_after_comparison jsonb, -- 前后对比数据
  
  -- 用户操作
  is_applied boolean default false, -- 是否已应用优化
  user_rating integer, -- 用户评分（1-5）
  
  -- 元数据
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. 面试模拟记录表
create table if not exists interview_simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- 面试设置
  position_name text not null, -- 岗位名称
  interview_type text not null, -- 面试类型：technical, behavioral, case, comprehensive
  difficulty_level text default 'medium', -- 难度：easy, medium, hard
  
  -- 面试问题和回答
  questions_and_answers jsonb not null, -- 问题和回答列表
  -- [{
  --   question: string,
  --   category: string,
  --   userAnswer: string,
  --   answerDuration: number,
  --   aiAnalysis: {
  --     score: number,
  --     strengths: string[],
  --     weaknesses: string[],
  --     suggestions: string[]
  --   }
  -- }]
  
  -- 整体评估
  overall_score integer not null, -- 总体评分（0-100）
  dimension_scores jsonb not null, -- 维度评分
  -- {
  --   contentQuality: number,
  --   logicClarity: number,
  --   expressionFluency: number,
  --   professionalDepth: number,
  --   responseSpeed: number
  -- }
  
  -- AI反馈
  strengths jsonb default '[]'::jsonb, -- 优势
  weaknesses jsonb default '[]'::jsonb, -- 待提升项
  improvement_suggestions jsonb default '[]'::jsonb, -- 改进建议
  recommended_practice_topics jsonb default '[]'::jsonb, -- 推荐练习题目
  
  -- 面试表现
  interview_duration integer, -- 面试时长（秒）
  completion_rate integer, -- 完成率（%）
  
  -- 用户反馈
  user_rating integer, -- 用户评分（1-5）
  user_notes text, -- 用户笔记
  
  -- 元数据
  created_at timestamptz default now()
);

-- 创建索引
create index if not exists idx_job_seeker_profiles_user_id on job_seeker_profiles(user_id);
create index if not exists idx_career_consultations_user_id on career_consultations(user_id);
create index if not exists idx_career_consultations_created_at on career_consultations(created_at desc);
create index if not exists idx_resume_optimizations_user_id on resume_optimizations(user_id);
create index if not exists idx_resume_optimizations_created_at on resume_optimizations(created_at desc);
create index if not exists idx_interview_simulations_user_id on interview_simulations(user_id);
create index if not exists idx_interview_simulations_created_at on interview_simulations(created_at desc);

-- RLS策略
alter table job_seeker_profiles enable row level security;
alter table career_consultations enable row level security;
alter table resume_optimizations enable row level security;
alter table interview_simulations enable row level security;

-- 求职者画像表策略
create policy "用户可以查看自己的画像"
  on job_seeker_profiles for select
  using (auth.uid() = user_id);

create policy "用户可以创建自己的画像"
  on job_seeker_profiles for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的画像"
  on job_seeker_profiles for update
  using (auth.uid() = user_id);

-- 就业咨询记录表策略
create policy "用户可以查看自己的咨询记录"
  on career_consultations for select
  using (auth.uid() = user_id);

create policy "用户可以创建咨询记录"
  on career_consultations for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的咨询记录"
  on career_consultations for update
  using (auth.uid() = user_id);

-- 简历优化记录表策略
create policy "用户可以查看自己的简历优化记录"
  on resume_optimizations for select
  using (auth.uid() = user_id);

create policy "用户可以创建简历优化记录"
  on resume_optimizations for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的简历优化记录"
  on resume_optimizations for update
  using (auth.uid() = user_id);

-- 面试模拟记录表策略
create policy "用户可以查看自己的面试模拟记录"
  on interview_simulations for select
  using (auth.uid() = user_id);

create policy "用户可以创建面试模拟记录"
  on interview_simulations for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的面试模拟记录"
  on interview_simulations for update
  using (auth.uid() = user_id);
