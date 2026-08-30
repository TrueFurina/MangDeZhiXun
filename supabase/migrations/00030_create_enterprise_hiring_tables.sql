-- 企业招聘数据缓存表
CREATE TABLE IF NOT EXISTS enterprise_hiring_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL, -- 企业名称或统一信用代码
  company_name TEXT, -- 企业名称
  
  -- 招聘概况数据
  title_kw TEXT, -- 职位关键词
  title_type TEXT, -- 职位类型
  city TEXT, -- 城市分布
  src TEXT, -- 招聘来源
  title_level TEXT, -- 职位级别
  avg_sal TEXT, -- 平均薪资
  title_cnt INTEGER, -- 职位数量
  title_modify_date TEXT, -- 职位更新时间
  city_cnt INTEGER, -- 城市数量
  
  -- 招聘统计数据
  avg_sal_str TEXT, -- 平均薪资字符串
  avg_sal_num DECIMAL, -- 平均薪资数值
  bk_education TEXT, -- 本科学历占比
  education_list JSONB, -- 学历分布列表
  pri_province TEXT, -- 主要省份
  zpnumber_list JSONB, -- 招聘数量时间序列
  salary_list JSONB, -- 薪资区间分布
  btw3and5_years TEXT, -- 3-5年工作经验占比
  recruit_position JSONB, -- 招聘职位列表
  years_list JSONB, -- 工作年限分布
  zpnumber INTEGER, -- 总招聘数量
  ss_num_his_list JSONB, -- 年度招聘数量统计
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(keyword)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_enterprise_hiring_cache_keyword ON enterprise_hiring_cache(keyword);
CREATE INDEX IF NOT EXISTS idx_enterprise_hiring_cache_company_name ON enterprise_hiring_cache(company_name);
CREATE INDEX IF NOT EXISTS idx_enterprise_hiring_cache_updated_at ON enterprise_hiring_cache(updated_at);

-- 企业招聘查询历史记录表
CREATE TABLE IF NOT EXISTS enterprise_hiring_query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL, -- 查询关键词
  query_type TEXT NOT NULL, -- 查询类型：overview（概况）或 statistics（统计）
  success BOOLEAN DEFAULT true, -- 查询是否成功
  error_message TEXT, -- 错误信息
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_enterprise_hiring_query_history_user_id ON enterprise_hiring_query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_hiring_query_history_created_at ON enterprise_hiring_query_history(created_at);

-- 启用 RLS
ALTER TABLE enterprise_hiring_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_hiring_query_history ENABLE ROW LEVEL SECURITY;

-- 缓存表策略：所有认证用户可读
CREATE POLICY "enterprise_hiring_cache_select_policy"
  ON enterprise_hiring_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- 查询历史策略：用户只能查看自己的历史记录
CREATE POLICY "enterprise_hiring_query_history_select_policy"
  ON enterprise_hiring_query_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 查询历史策略：用户可以插入自己的记录
CREATE POLICY "enterprise_hiring_query_history_insert_policy"
  ON enterprise_hiring_query_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE enterprise_hiring_cache IS '企业招聘数据缓存表';
COMMENT ON TABLE enterprise_hiring_query_history IS '企业招聘查询历史记录表';