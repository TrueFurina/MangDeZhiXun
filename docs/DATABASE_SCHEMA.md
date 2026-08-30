# 芒得很职 - 数据表结构设计文档

## 一、核心数据表清单

### 1. 用户与权限相关（3张表）
- `user_profiles` - 用户档案表
- `companies` - 企业信息表
- `universities` - 高校信息表

### 2. 学习相关（2张表）
- `course_progress` - 课程进度表
- `learning_records` - 学习记录表

### 3. 测评相关（3张表）
- `assessment_tasks` - 测评任务表
- `assessment_records` - 测评记录表
- `assessment_results` - 测评结果表

### 4. 校企合作相关（4张表）
- `cooperation_agreements` - 合作协议表
- `cooperation_companies` - 合作企业表
- `cooperation_plans` - 合作方案表
- `cooperation_projects` - 合作项目表

---

## 二、详细表结构

### 1. user_profiles（用户档案表）

**用途**：存储用户基本信息和角色权限

**字段设计**：
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  user_role TEXT CHECK (user_role IN ('student', 'company', 'university', 'admin')),
  university_ref_id INTEGER,
  college_id UUID,
  university_name TEXT,
  college_name TEXT,
  vip_level TEXT,
  vip_expire_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**索引**：
```sql
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_user_role ON user_profiles(user_role);
CREATE INDEX idx_user_profiles_university_ref_id ON user_profiles(university_ref_id);
```

**RLS策略**：
```sql
-- 用户可以查看自己的档案
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以更新自己的档案
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 管理员可以查看所有档案
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND user_role = 'admin'
    )
  );
```

---

### 2. companies（企业信息表）

**用途**：存储企业基本信息

**字段设计**：
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT,
  scale TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  description TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS策略**：
```sql
-- 所有认证用户可查看企业信息
CREATE POLICY "Authenticated users can view companies" ON companies
  FOR SELECT TO authenticated USING (true);

-- 企业用户可更新自己的企业信息
CREATE POLICY "Company users can update own company" ON companies
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_role = 'company'
    )
  );
```

---

### 3. universities（高校信息表）

**用途**：存储高校基本信息

**字段设计**：
```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name TEXT NOT NULL,
  university_type TEXT,
  location TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  description TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS策略**：
```sql
-- 所有认证用户可查看高校信息
CREATE POLICY "Authenticated users can view universities" ON universities
  FOR SELECT TO authenticated USING (true);

-- 高校用户可更新自己的高校信息
CREATE POLICY "University users can update own university" ON universities
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_role = 'university'
    )
  );
```

---

### 4. course_progress（课程进度表）

**用途**：存储学生学习进度（三段式：0/50/100）

**字段设计**：
```sql
CREATE TABLE course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  course_id BIGINT NOT NULL,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent IN (0, 50, 100)),
  is_completed BOOLEAN DEFAULT false,
  exam_passed BOOLEAN DEFAULT false,
  last_studied_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, course_id)
);
```

**业务逻辑**：
- 点击"开始学习" → `progress_percent = 50`
- 点击"确认完成" → `progress_percent = 100`, `is_completed = true`

**索引**：
```sql
CREATE INDEX idx_course_progress_user_email ON course_progress(user_email);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
```

**RLS策略**：
```sql
-- 用户只能查看自己的课程进度
CREATE POLICY "Users can view own course progress" ON course_progress
  FOR SELECT USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 用户可以插入自己的课程进度
CREATE POLICY "Users can insert own course progress" ON course_progress
  FOR INSERT WITH CHECK (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- 用户可以更新自己的课程进度
CREATE POLICY "Users can update own course progress" ON course_progress
  FOR UPDATE USING (
    user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
```

---

### 5. learning_records（学习记录表）

**用途**：存储详细学习记录

**字段设计**：
```sql
CREATE TABLE learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  task_id UUID,
  path_id UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0, -- 花费时间（分钟）
  submission_content TEXT,
  submission_files JSONB,
  evaluation_result JSONB,
  ability_improvements JSONB,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**索引**：
```sql
CREATE INDEX idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX idx_learning_records_status ON learning_records(status);
```

**RLS策略**：
```sql
-- 用户只能查看自己的学习记录
CREATE POLICY "Users can view own learning records" ON learning_records
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以插入自己的学习记录
CREATE POLICY "Users can insert own learning records" ON learning_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的学习记录
CREATE POLICY "Users can update own learning records" ON learning_records
  FOR UPDATE USING (auth.uid() = user_id);
```

---

### 6. assessment_records（测评记录表）

**用途**：存储测评任务和结果

**字段设计**：
```sql
CREATE TABLE assessment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_id UUID,
  assessment_name TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  position_name TEXT,
  score INTEGER,
  max_score INTEGER DEFAULT 100,
  result_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**索引**：
```sql
CREATE INDEX idx_assessment_records_user_id ON assessment_records(user_id);
CREATE INDEX idx_assessment_records_assessment_id ON assessment_records(assessment_id);
CREATE INDEX idx_assessment_records_status ON assessment_records(status);
```

**RLS策略**：
```sql
-- 用户可查看自己的测评记录
CREATE POLICY "Users can view own assessment records" ON assessment_records
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_role IN ('company', 'admin')
    )
  );

-- 用户可以插入自己的测评记录
CREATE POLICY "Users can insert own assessment records" ON assessment_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### 7. cooperation_agreements（校企合作协议表）

**用途**：存储校企合作档案

**字段设计**：
```sql
CREATE TABLE cooperation_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id INTEGER NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  agreement_name TEXT NOT NULL,
  agreement_type TEXT NOT NULL,
  signing_entity TEXT,
  effective_start_date DATE,
  effective_end_date DATE,
  agreement_status TEXT DEFAULT 'active' CHECK (agreement_status IN ('active', 'expired', 'terminated')),
  agreement_file_url TEXT,
  signing_date DATE,
  agreement_content TEXT,
  archived_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**索引**：
```sql
CREATE INDEX idx_cooperation_university_id ON cooperation_agreements(university_id);
CREATE INDEX idx_cooperation_company_id ON cooperation_agreements(company_id);
CREATE INDEX idx_cooperation_status ON cooperation_agreements(agreement_status);
```

**RLS策略**：
```sql
-- 高校和企业用户可查看相关协议
CREATE POLICY "Users can view related cooperation agreements" ON cooperation_agreements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_role IN ('university', 'company', 'admin')
    )
  );

-- 高校用户可管理校企合作协议
CREATE POLICY "University users can manage cooperation agreements" ON cooperation_agreements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.user_role IN ('university', 'admin')
    )
  );
```

---

## 三、数据关系图

```
┌─────────────────┐
│  auth.users     │
│  (Supabase)     │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│ user_profiles   │◄──────┐
│ - user_role     │       │
│ - university_id │       │
│ - company_id    │       │
└────────┬────────┘       │
         │                │
         │ 1:N            │ N:1
         ▼                │
┌─────────────────┐       │
│ course_progress │       │
│ - user_email    │       │
│ - progress_%    │       │
└─────────────────┘       │
         │                │
         │ 1:N            │
         ▼                │
┌─────────────────┐       │
│ learning_records│       │
│ - user_id       │       │
│ - time_spent    │       │
└─────────────────┘       │
         │                │
         │ 1:N            │
         ▼                │
┌─────────────────┐       │
│assessment_records│      │
│ - user_id       │       │
│ - score         │       │
└─────────────────┘       │
                          │
┌─────────────────┐       │
│   companies     │───────┘
│ - company_name  │
└────────┬────────┘
         │
         │ N:M
         ▼
┌─────────────────┐
│cooperation_     │
│agreements       │
│ - university_id │
│ - company_id    │
└────────┬────────┘
         │
         │ N:1
         ▼
┌─────────────────┐
│  universities   │
│ - university_   │
│   name          │
└─────────────────┘
```

---

## 四、数据初始化脚本

### 4.1 插入测试企业数据
```sql
INSERT INTO companies (company_name, industry, scale, contact_person, contact_phone, contact_email, description, status)
VALUES
  ('阿里巴巴集团', '互联网', '10000人以上', '张经理', '13800138000', 'zhang@alibaba.com', '全球领先的电商平台', 'active'),
  ('腾讯科技', '互联网', '10000人以上', '李经理', '13800138001', 'li@tencent.com', '中国领先的互联网公司', 'active'),
  ('字节跳动', '互联网', '10000人以上', '王经理', '13800138002', 'wang@bytedance.com', '全球化的互联网科技公司', 'active'),
  ('华为技术', '通信设备', '10000人以上', '赵经理', '13800138003', 'zhao@huawei.com', '全球领先的ICT解决方案提供商', 'active'),
  ('百度在线', '互联网', '10000人以上', '刘经理', '13800138004', 'liu@baidu.com', '全球最大的中文搜索引擎', 'active');
```

### 4.2 插入测试高校数据
```sql
INSERT INTO universities (university_name, university_type, location, contact_person, contact_phone, contact_email, description, status)
VALUES
  ('清华大学', '985/211', '北京市', '陈老师', '010-62770000', 'chen@tsinghua.edu.cn', '中国顶尖综合性大学', 'active'),
  ('北京大学', '985/211', '北京市', '林老师', '010-62750000', 'lin@pku.edu.cn', '中国最著名的综合性大学', 'active'),
  ('浙江大学', '985/211', '浙江省杭州市', '吴老师', '0571-87951111', 'wu@zju.edu.cn', '中国顶尖综合性大学', 'active'),
  ('上海交通大学', '985/211', '上海市', '郑老师', '021-54740000', 'zheng@sjtu.edu.cn', '中国历史最悠久的高等学府之一', 'active'),
  ('复旦大学', '985/211', '上海市', '周老师', '021-65642222', 'zhou@fudan.edu.cn', '中国顶尖综合性研究型大学', 'active');
```

### 4.3 插入测试课程数据
```sql
-- 注意：需要先有用户注册后才能插入课程进度
-- 示例：假设用户邮箱为 student@example.com
INSERT INTO course_progress (user_email, course_id, progress_percent, is_completed, last_studied_at)
VALUES
  ('student@example.com', 1, 100, true, NOW()),
  ('student@example.com', 2, 50, false, NOW()),
  ('student@example.com', 3, 0, false, NULL);
```

---

## 五、常用查询SQL

### 5.1 查询用户学习统计
```sql
SELECT 
  user_email,
  COUNT(*) as total_courses,
  SUM(CASE WHEN is_completed THEN 1 ELSE 0 END) as completed_courses,
  SUM(CASE WHEN progress_percent = 50 THEN 1 ELSE 0 END) as in_progress_courses,
  ROUND(AVG(progress_percent), 2) as avg_progress
FROM course_progress
WHERE user_email = 'student@example.com'
GROUP BY user_email;
```

### 5.2 查询企业测评统计
```sql
SELECT 
  a.assessment_name,
  COUNT(ar.id) as total_participants,
  AVG(ar.score) as avg_score,
  MAX(ar.score) as max_score,
  MIN(ar.score) as min_score
FROM assessment_records ar
JOIN assessment_tasks a ON ar.assessment_id = a.id
WHERE ar.status = 'completed'
GROUP BY a.assessment_name
ORDER BY total_participants DESC;
```

### 5.3 查询校企合作统计
```sql
SELECT 
  u.university_name,
  COUNT(DISTINCT ca.company_id) as cooperation_count,
  COUNT(CASE WHEN ca.agreement_status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN ca.agreement_status = 'expired' THEN 1 END) as expired_count
FROM cooperation_agreements ca
JOIN universities u ON ca.university_id = u.id
GROUP BY u.university_name
ORDER BY cooperation_count DESC;
```

### 5.4 查询学生成长数据
```sql
SELECT 
  up.nickname,
  up.university_name,
  COUNT(DISTINCT cp.course_id) as completed_courses,
  COUNT(DISTINCT ar.id) as completed_assessments,
  AVG(ar.score) as avg_assessment_score,
  SUM(lr.time_spent) as total_learning_time
FROM user_profiles up
LEFT JOIN course_progress cp ON up.email = cp.user_email AND cp.is_completed = true
LEFT JOIN assessment_records ar ON up.user_id = ar.user_id AND ar.status = 'completed'
LEFT JOIN learning_records lr ON up.user_id = lr.user_id AND lr.status = 'completed'
WHERE up.user_role = 'student'
GROUP BY up.nickname, up.university_name
ORDER BY completed_courses DESC, avg_assessment_score DESC;
```

---

## 六、数据维护

### 6.1 定期清理过期数据
```sql
-- 清理90天前的已完成学习记录
DELETE FROM learning_records
WHERE status = 'completed' 
AND completed_at < NOW() - INTERVAL '90 days';

-- 归档过期的校企合作协议
UPDATE cooperation_agreements
SET agreement_status = 'expired',
    archived_at = NOW()
WHERE effective_end_date < CURRENT_DATE
AND agreement_status = 'active';
```

### 6.2 数据备份
```sql
-- 备份用户档案
CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles;

-- 备份课程进度
CREATE TABLE course_progress_backup AS SELECT * FROM course_progress;

-- 备份测评记录
CREATE TABLE assessment_records_backup AS SELECT * FROM assessment_records;
```

---

## 七、性能优化建议

### 7.1 索引优化
- 为高频查询字段创建索引
- 定期分析查询性能，优化慢查询
- 使用复合索引优化多条件查询

### 7.2 查询优化
- 使用分页查询，避免一次性加载大量数据
- 使用JOIN代替多次查询
- 合理使用缓存减少数据库压力

### 7.3 数据归档
- 定期归档历史数据
- 保留最近3个月的热数据
- 历史数据可导出到文件存储

---

**文档版本**：v1.0  
**更新日期**：2026-03-12  
**维护人员**：技术团队
