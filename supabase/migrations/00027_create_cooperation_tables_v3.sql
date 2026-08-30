-- 1. 创建二级学院信息表（使用现有universities表的university_id）
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id INTEGER NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(university_id, name)
);

-- 2. 扩展user_profiles表
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'student',
ADD COLUMN IF NOT EXISTS university_ref_id INTEGER,
ADD COLUMN IF NOT EXISTS college_id UUID,
ADD COLUMN IF NOT EXISTS university_name TEXT,
ADD COLUMN IF NOT EXISTS college_name TEXT;

-- 3. 合作企业信息表
CREATE TABLE IF NOT EXISTS cooperation_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id INTEGER NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  credit_code TEXT UNIQUE,
  industry TEXT NOT NULL CHECK (industry IN ('跨境电商', '互联网', '新能源', '智能制造', '金融', '教育', '医疗', '其他')),
  company_scale TEXT CHECK (company_scale IN ('50人以下', '50-200人', '200-500人', '500人以上')),
  cooperation_level TEXT DEFAULT '普通合作单位' CHECK (cooperation_level IN ('战略合作伙伴', '核心合作单位', '普通合作单位')),
  address TEXT,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  business_license_url TEXT,
  qualification_files TEXT[],
  audit_status TEXT DEFAULT '待审核' CHECK (audit_status IN ('待审核', '审核通过', '审核驳回')),
  audit_comment TEXT,
  company_status TEXT DEFAULT '正常合作' CHECK (company_status IN ('正常合作', '暂停合作', '终止合作')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 校企合作方案表
CREATE TABLE IF NOT EXISTS cooperation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id INTEGER NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES cooperation_companies(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('实习基地共建', '课程体系共建', '职前培训合作', '就业推荐合作', '创新创业合作', '其他')),
  plan_status TEXT DEFAULT '意向沟通' CHECK (plan_status IN ('意向沟通', '方案洽谈', '推进中', '已落地', '已终止')),
  cooperation_start_date DATE,
  cooperation_end_date DATE,
  plan_details TEXT,
  responsible_person TEXT NOT NULL,
  responsible_phone TEXT NOT NULL,
  company_contact TEXT,
  plan_attachments TEXT[],
  landing_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 企业岗位信息表
CREATE TABLE IF NOT EXISTS company_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id INTEGER NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES cooperation_companies(id) ON DELETE CASCADE,
  position_name TEXT NOT NULL,
  position_type TEXT NOT NULL CHECK (position_type IN ('实习岗位', '校招全职岗位', '社招岗位')),
  industry TEXT,
  work_location TEXT,
  recruit_count INTEGER,
  salary_range TEXT,
  position_requirements TEXT,
  competency_model_id UUID,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  deadline DATE,
  audit_status TEXT DEFAULT '待审核' CHECK (audit_status IN ('待审核', '审核通过', '审核驳回')),
  position_status TEXT DEFAULT '招聘中' CHECK (position_status IN ('招聘中', '已截止', '已下架')),
  audit_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 学生岗位投递表
CREATE TABLE IF NOT EXISTS student_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES company_positions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_major TEXT,
  student_grade TEXT,
  contact_phone TEXT,
  competency_score DECIMAL(5,2),
  match_score DECIMAL(5,2),
  application_status TEXT DEFAULT '已投递' CHECK (application_status IN ('已投递', '企业已查看', '面试中', '已录用', '已淘汰')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 合作项目表
CREATE TABLE IF NOT EXISTS cooperation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id INTEGER NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  plan_id UUID REFERENCES cooperation_plans(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES cooperation_companies(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('实习基地建设', '课程共建项目', '就业培训项目', '创新创业项目', '课题联合研究')),
  project_stage TEXT DEFAULT '筹备期' CHECK (project_stage IN ('筹备期', '启动期', '执行期', '验收期', '已完成', '已终止')),
  project_start_date DATE,
  project_end_date DATE,
  project_leader TEXT NOT NULL,
  project_members TEXT[],
  company_contact TEXT,
  project_goals TEXT,
  stage_plans JSONB,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  project_attachments TEXT[],
  acceptance_result TEXT CHECK (acceptance_result IN ('未验收', '验收通过', '验收不通过')),
  acceptance_report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 项目进度记录表
CREATE TABLE IF NOT EXISTS project_progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES cooperation_projects(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  progress_content TEXT NOT NULL,
  evidence_files TEXT[],
  recorder TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 合作协议表
CREATE TABLE IF NOT EXISTS cooperation_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id INTEGER NOT NULL REFERENCES universities(university_id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES cooperation_companies(id) ON DELETE CASCADE,
  agreement_name TEXT NOT NULL,
  agreement_type TEXT NOT NULL CHECK (agreement_type IN ('框架合作协议', '实习基地协议', '课程共建协议', '就业推荐协议', '保密协议', '其他')),
  signing_entity TEXT NOT NULL,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE NOT NULL,
  agreement_status TEXT DEFAULT '未生效' CHECK (agreement_status IN ('未生效', '生效中', '已到期', '已归档')),
  agreement_file_url TEXT NOT NULL,
  signing_date DATE,
  agreement_content TEXT,
  archived_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 创建索引
CREATE INDEX IF NOT EXISTS idx_cooperation_companies_university ON cooperation_companies(university_id);
CREATE INDEX IF NOT EXISTS idx_cooperation_companies_audit_status ON cooperation_companies(audit_status);
CREATE INDEX IF NOT EXISTS idx_cooperation_plans_university ON cooperation_plans(university_id);
CREATE INDEX IF NOT EXISTS idx_cooperation_plans_company ON cooperation_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_company_positions_university ON company_positions(university_id);
CREATE INDEX IF NOT EXISTS idx_company_positions_company ON company_positions(company_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_position ON student_applications(position_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_student ON student_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_cooperation_projects_university ON cooperation_projects(university_id);
CREATE INDEX IF NOT EXISTS idx_cooperation_projects_company ON cooperation_projects(company_id);
CREATE INDEX IF NOT EXISTS idx_project_progress_records_project ON project_progress_records(project_id);
CREATE INDEX IF NOT EXISTS idx_cooperation_agreements_university ON cooperation_agreements(university_id);
CREATE INDEX IF NOT EXISTS idx_cooperation_agreements_company ON cooperation_agreements(company_id);

-- 11. 创建更新时间触发器
CREATE OR REPLACE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cooperation_companies_updated_at BEFORE UPDATE ON cooperation_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cooperation_plans_updated_at BEFORE UPDATE ON cooperation_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_company_positions_updated_at BEFORE UPDATE ON company_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_student_applications_updated_at BEFORE UPDATE ON student_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cooperation_projects_updated_at BEFORE UPDATE ON cooperation_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cooperation_agreements_updated_at BEFORE UPDATE ON cooperation_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();