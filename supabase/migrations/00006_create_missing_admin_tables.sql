-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建权限表
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- 创建测评题库表
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'scenario', 'practical', 'interview')),
  options JSONB,
  correct_answer JSONB,
  score INTEGER NOT NULL DEFAULT 10,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  related_positions JSONB,
  related_competencies JSONB,
  explanation TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(20) CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON question_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at DESC);

-- 插入初始角色数据
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', '超级管理员', '拥有系统所有权限'),
('admin', '管理员', '拥有大部分管理权限'),
('student', '学生', '学生用户'),
('company_hr', '企业HR', '企业招聘人员'),
('university_teacher', '高校老师', '高校就业办老师')
ON CONFLICT (name) DO NOTHING;

-- 插入初始权限数据
INSERT INTO permissions (name, display_name, resource, action, description) VALUES
('user.view', '查看用户', 'user', 'view', '查看用户列表和详情'),
('user.create', '创建用户', 'user', 'create', '添加新用户'),
('user.update', '编辑用户', 'user', 'update', '修改用户信息'),
('user.delete', '删除用户', 'user', 'delete', '删除用户'),
('user.disable', '禁用用户', 'user', 'disable', '禁用/启用用户'),
('role.view', '查看角色', 'role', 'view', '查看角色列表'),
('role.manage', '管理角色', 'role', 'manage', '创建、编辑、删除角色'),
('permission.manage', '管理权限', 'permission', 'manage', '配置权限'),
('content.view', '查看内容', 'content', 'view', '查看内容管理'),
('content.manage', '管理内容', 'content', 'manage', '管理岗位模型、学习资源、题库'),
('data.view', '查看数据', 'data', 'view', '查看数据统计'),
('config.view', '查看配置', 'config', 'view', '查看系统配置'),
('config.manage', '管理配置', 'config', 'manage', '修改系统配置'),
('log.view', '查看日志', 'log', 'view', '查看操作日志')
ON CONFLICT (name) DO NOTHING;

-- 插入初始系统配置
INSERT INTO system_config (config_key, config_value, config_type, display_name, description, category) VALUES
('evaluation_validity_days', '30', 'number', '测评有效期（天）', '测评结果的有效期限', 'evaluation'),
('ai_interview_concurrent_limit', '10', 'number', 'AI面试并发数', '同时进行AI面试的最大数量', 'ai'),
('basic_plan_price', '999', 'number', '基础版套餐价格', '企业基础版月费', 'pricing'),
('professional_plan_price', '2999', 'number', '专业版套餐价格', '企业专业版月费', 'pricing'),
('enterprise_plan_price', '9999', 'number', '企业定制版价格', '企业定制版月费', 'pricing')
ON CONFLICT (config_key) DO NOTHING;