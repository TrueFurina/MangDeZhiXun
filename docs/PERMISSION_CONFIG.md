# 芒得很职 - 四端权限配置文档

## 一、权限体系概述

### 1.1 四端角色定义

| 角色 | 标识 | 中文名称 | 权限级别 |
|------|------|----------|----------|
| Student | `student` | 学生端 | 基础用户 |
| Company | `company` | 企业端 | 企业用户 |
| University | `university` | 高校端 | 高校管理员 |
| Admin | `admin` | 管理端 | 超级管理员 |

### 1.2 权限设计原则

1. **最小权限原则**：用户只能访问必要的数据和功能
2. **数据隔离原则**：不同角色的数据完全隔离
3. **行级安全原则**：通过RLS策略实现数据行级控制
4. **功能隔离原则**：前端路由根据角色动态显示

---

## 二、学生端权限配置

### 2.1 功能权限

#### 可访问功能
- ✅ 查看课程列表
- ✅ 学习课程内容
- ✅ 记录学习进度
- ✅ 参与企业测评
- ✅ 查看测评结果
- ✅ 查看成长数据
- ✅ 管理个人档案
- ✅ 查看岗位推荐
- ✅ 投递简历

#### 禁止访问功能
- ❌ 发布岗位
- ❌ 查看其他学生数据
- ❌ 管理企业信息
- ❌ 管理高校信息
- ❌ 查看校企合作协议
- ❌ 系统配置管理

### 2.2 数据权限

#### 可查询数据
```sql
-- 自己的用户档案
SELECT * FROM user_profiles WHERE user_id = auth.uid();

-- 自己的学习进度
SELECT * FROM course_progress WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- 自己的学习记录
SELECT * FROM learning_records WHERE user_id = auth.uid();

-- 自己的测评记录
SELECT * FROM assessment_records WHERE user_id = auth.uid();

-- 所有企业信息（只读）
SELECT * FROM companies WHERE status = 'active';

-- 所有岗位信息（只读）
SELECT * FROM positions WHERE status = 'open';
```

#### 可修改数据
```sql
-- 更新自己的用户档案
UPDATE user_profiles SET ... WHERE user_id = auth.uid();

-- 插入/更新自己的学习进度
INSERT INTO course_progress (user_email, ...) VALUES (...);
UPDATE course_progress SET ... WHERE user_email = (SELECT email FROM auth.users WHERE id = auth.uid());

-- 插入/更新自己的学习记录
INSERT INTO learning_records (user_id, ...) VALUES (auth.uid(), ...);
UPDATE learning_records SET ... WHERE user_id = auth.uid();

-- 插入自己的测评记录
INSERT INTO assessment_records (user_id, ...) VALUES (auth.uid(), ...);
```

### 2.3 RLS策略

```sql
-- 用户档案策略
CREATE POLICY "Students can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id AND user_role = 'student');

CREATE POLICY "Students can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id AND user_role = 'student');

-- 课程进度策略
CREATE POLICY "Students can view own course progress" ON course_progress
  FOR SELECT USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Students can manage own course progress" ON course_progress
  FOR ALL USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 学习记录策略
CREATE POLICY "Students can view own learning records" ON learning_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can manage own learning records" ON learning_records
  FOR ALL USING (auth.uid() = user_id);

-- 测评记录策略
CREATE POLICY "Students can view own assessment records" ON assessment_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own assessment records" ON assessment_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2.4 前端路由

```typescript
// 学生端路由配置
const studentRoutes = [
  { path: '/student/home', component: StudentHomePage },
  { path: '/student/courses', component: CoursesPage },
  { path: '/student/learning/:courseId', component: LearningPage },
  { path: '/student/assessments', component: AssessmentsPage },
  { path: '/student/assessment/:id', component: AssessmentDetailPage },
  { path: '/student/growth', component: GrowthPage },
  { path: '/student/profile', component: ProfilePage },
  { path: '/student/jobs', component: JobsPage },
  { path: '/student/resumes', component: ResumesPage },
];

// 路由守卫
function studentRouteGuard(to, from, next) {
  const userRole = getUserRole();
  if (userRole === 'student') {
    next();
  } else {
    next('/unauthorized');
  }
}
```

---

## 三、企业端权限配置

### 3.1 功能权限

#### 可访问功能
- ✅ 发布岗位信息
- ✅ 管理岗位列表
- ✅ 创建测评任务
- ✅ 查看测评结果
- ✅ 查看候选人简历
- ✅ 管理企业信息
- ✅ 查看数据统计
- ✅ 校企合作申请

#### 禁止访问功能
- ❌ 查看其他企业数据
- ❌ 查看学生学习记录
- ❌ 管理高校信息
- ❌ 系统配置管理

### 3.2 数据权限

#### 可查询数据
```sql
-- 自己的企业信息
SELECT * FROM companies WHERE id = (
  SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 自己发布的岗位
SELECT * FROM positions WHERE company_id = (
  SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 自己发布的测评任务
SELECT * FROM assessment_tasks WHERE company_id = (
  SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 参与自己测评的记录
SELECT ar.*, up.nickname, up.email, up.university_name
FROM assessment_records ar
JOIN user_profiles up ON ar.user_id = up.user_id
WHERE ar.assessment_id IN (
  SELECT id FROM assessment_tasks WHERE company_id = (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  )
);

-- 投递到自己岗位的简历
SELECT * FROM student_applications WHERE position_id IN (
  SELECT id FROM positions WHERE company_id = (
    SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
  )
);
```

#### 可修改数据
```sql
-- 更新自己的企业信息
UPDATE companies SET ... WHERE id = (
  SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 管理自己的岗位
INSERT INTO positions (company_id, ...) VALUES (...);
UPDATE positions SET ... WHERE company_id = (
  SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 管理自己的测评任务
INSERT INTO assessment_tasks (company_id, ...) VALUES (...);
UPDATE assessment_tasks SET ... WHERE company_id = (
  SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
);
```

### 3.3 RLS策略

```sql
-- 企业信息策略
CREATE POLICY "Companies can view own info" ON companies
  FOR SELECT USING (
    id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can update own info" ON companies
  FOR UPDATE USING (
    id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- 岗位管理策略
CREATE POLICY "Companies can view own positions" ON positions
  FOR SELECT USING (
    company_id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can manage own positions" ON positions
  FOR ALL USING (
    company_id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- 测评任务策略
CREATE POLICY "Companies can view own assessment tasks" ON assessment_tasks
  FOR SELECT USING (
    company_id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can manage own assessment tasks" ON assessment_tasks
  FOR ALL USING (
    company_id = (SELECT company_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- 测评记录策略（企业可查看参与自己测评的记录）
CREATE POLICY "Companies can view related assessment records" ON assessment_records
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM assessment_tasks WHERE company_id = (
        SELECT company_id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );
```

### 3.4 前端路由

```typescript
// 企业端路由配置
const companyRoutes = [
  { path: '/company/dashboard', component: CompanyDashboardPage },
  { path: '/company/positions', component: PositionManagePage },
  { path: '/company/create-position', component: CreatePositionPage },
  { path: '/company/assessments', component: AssessmentManagePage },
  { path: '/company/create-assessment', component: CreateAssessmentPage },
  { path: '/company/resumes', component: ResumeManagePage },
  { path: '/company/evaluation', component: EvaluationPage },
  { path: '/company/profile', component: CompanyProfilePage },
  { path: '/company/cooperation', component: CooperationPage },
];

// 路由守卫
function companyRouteGuard(to, from, next) {
  const userRole = getUserRole();
  if (userRole === 'company') {
    next();
  } else {
    next('/unauthorized');
  }
}
```

---

## 四、高校端权限配置

### 4.1 功能权限

#### 可访问功能
- ✅ 查看本校学生列表
- ✅ 查看学生学习数据
- ✅ 查看学生测评结果
- ✅ 管理校企合作
- ✅ 创建合作协议
- ✅ 查看合作统计
- ✅ 管理高校信息
- ✅ 数据分析看板

#### 禁止访问功能
- ❌ 查看其他高校数据
- ❌ 修改学生学习记录
- ❌ 管理企业信息
- ❌ 系统配置管理

### 4.2 数据权限

#### 可查询数据
```sql
-- 自己的高校信息
SELECT * FROM universities WHERE id = (
  SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 本校学生列表
SELECT * FROM user_profiles 
WHERE user_role = 'student' 
AND university_ref_id = (
  SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 本校学生学习进度
SELECT cp.*, up.nickname, up.email
FROM course_progress cp
JOIN user_profiles up ON cp.user_email = up.email
WHERE up.university_ref_id = (
  SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 本校学生测评记录
SELECT ar.*, up.nickname, up.email
FROM assessment_records ar
JOIN user_profiles up ON ar.user_id = up.user_id
WHERE up.university_ref_id = (
  SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 本校校企合作协议
SELECT ca.*, c.company_name, c.industry
FROM cooperation_agreements ca
JOIN companies c ON ca.company_id = c.id
WHERE ca.university_id = (
  SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
);
```

#### 可修改数据
```sql
-- 更新自己的高校信息
UPDATE universities SET ... WHERE id = (
  SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
);

-- 管理校企合作协议
INSERT INTO cooperation_agreements (university_id, ...) VALUES (...);
UPDATE cooperation_agreements SET ... WHERE university_id = (
  SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
);
```

### 4.3 RLS策略

```sql
-- 高校信息策略
CREATE POLICY "Universities can view own info" ON universities
  FOR SELECT USING (
    id = (SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Universities can update own info" ON universities
  FOR UPDATE USING (
    id = (SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid())
  );

-- 学生数据查看策略
CREATE POLICY "Universities can view own students" ON user_profiles
  FOR SELECT USING (
    user_role = 'student' AND university_ref_id = (
      SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- 学生学习进度查看策略
CREATE POLICY "Universities can view students course progress" ON course_progress
  FOR SELECT USING (
    user_email IN (
      SELECT email FROM user_profiles 
      WHERE university_ref_id = (
        SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 校企合作协议策略
CREATE POLICY "Universities can view own cooperation agreements" ON cooperation_agreements
  FOR SELECT USING (
    university_id = (SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Universities can manage own cooperation agreements" ON cooperation_agreements
  FOR ALL USING (
    university_id = (SELECT university_ref_id FROM user_profiles WHERE user_id = auth.uid())
  );
```

### 4.4 前端路由

```typescript
// 高校端路由配置
const universityRoutes = [
  { path: '/university/dashboard', component: UniversityDashboardPage },
  { path: '/university/students', component: StudentManagePage },
  { path: '/university/student/:id', component: StudentDetailPage },
  { path: '/university/cooperation', component: CooperationManagePage },
  { path: '/university/create-cooperation', component: CreateCooperationPage },
  { path: '/university/analytics', component: AnalyticsPage },
  { path: '/university/profile', component: UniversityProfilePage },
];

// 路由守卫
function universityRouteGuard(to, from, next) {
  const userRole = getUserRole();
  if (userRole === 'university') {
    next();
  } else {
    next('/unauthorized');
  }
}
```

---

## 五、管理端权限配置

### 5.1 功能权限

#### 可访问功能
- ✅ 查看所有用户数据
- ✅ 管理用户权限
- ✅ 查看所有企业信息
- ✅ 查看所有高校信息
- ✅ 查看所有学习记录
- ✅ 查看所有测评记录
- ✅ 查看所有校企合作
- ✅ 系统配置管理
- ✅ 数据统计分析
- ✅ 日志查看

#### 禁止访问功能
- 无（管理员拥有最高权限）

### 5.2 数据权限

#### 可查询数据
```sql
-- 所有用户档案
SELECT * FROM user_profiles;

-- 所有企业信息
SELECT * FROM companies;

-- 所有高校信息
SELECT * FROM universities;

-- 所有学习记录
SELECT * FROM learning_records;

-- 所有测评记录
SELECT * FROM assessment_records;

-- 所有校企合作协议
SELECT * FROM cooperation_agreements;

-- 系统配置
SELECT * FROM system_config;

-- 操作日志
SELECT * FROM operation_logs;
```

#### 可修改数据
```sql
-- 管理所有表的数据
-- 管理员拥有完全的增删改查权限
```

### 5.3 RLS策略

```sql
-- 管理员可以查看所有数据
CREATE POLICY "Admins can view all data" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND user_role = 'admin'
    )
  );

-- 管理员可以修改所有数据
CREATE POLICY "Admins can manage all data" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND user_role = 'admin'
    )
  );

-- 对所有表应用相同的管理员策略
-- companies, universities, learning_records, assessment_records, cooperation_agreements 等
```

### 5.4 前端路由

```typescript
// 管理端路由配置
const adminRoutes = [
  { path: '/admin/dashboard', component: AdminDashboardPage },
  { path: '/admin/users', component: UserManagePage },
  { path: '/admin/companies', component: CompanyManagePage },
  { path: '/admin/universities', component: UniversityManagePage },
  { path: '/admin/learning', component: LearningManagePage },
  { path: '/admin/assessments', component: AssessmentManagePage },
  { path: '/admin/cooperation', component: CooperationManagePage },
  { path: '/admin/system', component: SystemConfigPage },
  { path: '/admin/logs', component: LogsPage },
  { path: '/admin/analytics', component: AnalyticsPage },
];

// 路由守卫
function adminRouteGuard(to, from, next) {
  const userRole = getUserRole();
  if (userRole === 'admin') {
    next();
  } else {
    next('/unauthorized');
  }
}
```

---

## 六、权限验证实现

### 6.1 前端权限验证

```typescript
// 获取当前用户角色
export async function getCurrentUserRole(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_role')
    .eq('user_id', user.id)
    .single();
  
  return profile?.user_role || null;
}

// 检查用户是否有权限访问某个功能
export function hasPermission(requiredRole: string): boolean {
  const userRole = getCurrentUserRole();
  
  const roleHierarchy = {
    'admin': 4,
    'university': 3,
    'company': 2,
    'student': 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// 路由守卫
export function createRouteGuard(requiredRole: string) {
  return async (to, from, next) => {
    const userRole = await getCurrentUserRole();
    
    if (!userRole) {
      next('/login');
      return;
    }
    
    if (hasPermission(requiredRole)) {
      next();
    } else {
      next('/unauthorized');
    }
  };
}
```

### 6.2 后端权限验证（RLS策略）

```sql
-- 创建辅助函数：获取当前用户角色
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT user_role FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- 创建辅助函数：检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND user_role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 创建辅助函数：检查是否为企业用户
CREATE OR REPLACE FUNCTION is_company_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND user_role = 'company'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 创建辅助函数：检查是否为高校用户
CREATE OR REPLACE FUNCTION is_university_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND user_role = 'university'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- 使用辅助函数简化RLS策略
CREATE POLICY "Role-based access" ON user_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR is_admin()
  );
```

---

## 七、权限测试用例

### 7.1 学生端权限测试

```typescript
// 测试学生只能查看自己的数据
test('Student can only view own data', async () => {
  const studentUser = await createTestUser('student');
  const otherStudent = await createTestUser('student');
  
  // 学生可以查看自己的学习进度
  const { data: ownProgress } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_email', studentUser.email);
  expect(ownProgress).toBeDefined();
  
  // 学生不能查看其他学生的学习进度
  const { data: otherProgress } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_email', otherStudent.email);
  expect(otherProgress).toBeNull();
});

// 测试学生不能访问企业功能
test('Student cannot access company features', async () => {
  const studentUser = await createTestUser('student');
  
  // 学生不能创建岗位
  const { error } = await supabase
    .from('positions')
    .insert({ company_id: 'some-id', position_name: 'Test' });
  expect(error).toBeDefined();
});
```

### 7.2 企业端权限测试

```typescript
// 测试企业只能查看自己的数据
test('Company can only view own data', async () => {
  const companyUser = await createTestUser('company');
  const otherCompany = await createTestUser('company');
  
  // 企业可以查看自己的岗位
  const { data: ownPositions } = await supabase
    .from('positions')
    .select('*')
    .eq('company_id', companyUser.company_id);
  expect(ownPositions).toBeDefined();
  
  // 企业不能查看其他企业的岗位
  const { data: otherPositions } = await supabase
    .from('positions')
    .select('*')
    .eq('company_id', otherCompany.company_id);
  expect(otherPositions).toBeNull();
});
```

### 7.3 高校端权限测试

```typescript
// 测试高校只能查看本校学生数据
test('University can only view own students', async () => {
  const universityUser = await createTestUser('university');
  const otherUniversity = await createTestUser('university');
  
  // 高校可以查看本校学生
  const { data: ownStudents } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('university_ref_id', universityUser.university_ref_id)
    .eq('user_role', 'student');
  expect(ownStudents).toBeDefined();
  
  // 高校不能查看其他高校学生
  const { data: otherStudents } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('university_ref_id', otherUniversity.university_ref_id)
    .eq('user_role', 'student');
  expect(otherStudents).toBeNull();
});
```

### 7.4 管理端权限测试

```typescript
// 测试管理员可以查看所有数据
test('Admin can view all data', async () => {
  const adminUser = await createTestUser('admin');
  
  // 管理员可以查看所有用户
  const { data: allUsers } = await supabase
    .from('user_profiles')
    .select('*');
  expect(allUsers).toBeDefined();
  expect(allUsers.length).toBeGreaterThan(0);
  
  // 管理员可以查看所有企业
  const { data: allCompanies } = await supabase
    .from('companies')
    .select('*');
  expect(allCompanies).toBeDefined();
  
  // 管理员可以查看所有高校
  const { data: allUniversities } = await supabase
    .from('universities')
    .select('*');
  expect(allUniversities).toBeDefined();
});
```

---

## 八、权限配置检查清单

### 8.1 数据库层面
- [ ] 所有表已启用RLS
- [ ] 每个表都有完整的RLS策略
- [ ] 辅助函数已创建
- [ ] 索引已优化
- [ ] 触发器已配置

### 8.2 应用层面
- [ ] 前端路由守卫已配置
- [ ] 角色验证函数已实现
- [ ] 权限检查已集成到所有API调用
- [ ] 错误处理已完善
- [ ] 未授权访问已正确处理

### 8.3 测试层面
- [ ] 单元测试已覆盖所有权限场景
- [ ] 集成测试已验证权限隔离
- [ ] 性能测试已通过
- [ ] 安全测试已完成

---

## 九、常见问题

### Q1: 如何添加新角色？
A: 修改user_profiles表的user_role字段约束，添加新的角色类型，然后创建对应的RLS策略。

### Q2: 如何临时提升用户权限？
A: 管理员可以修改user_profiles表中的user_role字段，临时提升用户权限。

### Q3: 权限策略不生效怎么办？
A: 检查RLS是否已启用，策略是否正确，辅助函数是否存在。

### Q4: 如何调试权限问题？
A: 使用Supabase后台的SQL编辑器，直接执行查询语句，查看返回结果。

---

**文档版本**：v1.0  
**更新日期**：2026-03-12  
**维护人员**：技术团队
