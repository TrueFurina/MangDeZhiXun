# 校企合作管理系统使用说明

## 系统概述

本系统是一个完整的高校端校企合作管理平台，涵盖合作企业管理、方案管理、岗位对接、项目管理、协议档案和数据看板六大核心模块。

## 功能模块

### 1. 合作企业信息管理
- ✅ 企业列表展示（支持搜索、筛选）
- ✅ 企业新增功能（完整表单）
- ✅ 企业详情查看
- ✅ 企业审核功能（审核通过/驳回）
- ✅ 统计指标卡（总数、已审核、待审核、驳回）
- ✅ 企业状态管理

### 2. 校企合作方案管理
- ✅ 方案列表展示
- ✅ 方案搜索功能
- ✅ 方案状态展示（意向沟通、方案洽谈、推进中、已落地、已终止）
- ✅ 统计指标卡（总数、推进中、已落地）
- ⏳ 方案新增/编辑（预留接口）

### 3. 实习就业岗位对接
- ✅ 岗位列表展示
- ✅ 岗位搜索功能
- ✅ 岗位审核状态展示
- ✅ 统计指标卡（总数、招聘中、待审核）
- ⏳ 岗位审核功能（预留接口）
- ⏳ 学生投递数据查看（预留接口）

### 4. 合作项目落地管理
- ✅ 项目列表展示
- ✅ 项目搜索功能
- ✅ 项目进度条展示
- ✅ 项目阶段管理
- ✅ 统计指标卡（总数、进行中、已验收）
- ⏳ 项目新增/编辑（预留接口）
- ⏳ 进度填报功能（预留接口）

### 5. 合作协议档案管理
- ✅ 协议列表展示
- ✅ 协议搜索功能
- ✅ 到期提醒功能（30天内到期高亮显示）
- ✅ 协议状态管理
- ✅ 统计指标卡（总数、生效中、即将到期）
- ⏳ 协议新增/编辑（预留接口）
- ⏳ 协议文件下载（预留接口）

### 6. 校企合作数据看板
- ✅ 6个核心指标卡
  - 合作企业总数
  - 已落地合作方案数
  - 在推进合作项目数
  - 有效招聘岗位数
  - 学生投递总数
  - 生效中协议数
- ✅ 实时数据统计
- ✅ 数据自动计算
- ⏳ 图表可视化（预留区域）

## 数据库设计

### 核心表结构
1. **universities** - 高校信息表（已存在）
2. **colleges** - 二级学院信息表
3. **cooperation_companies** - 合作企业信息表
4. **cooperation_plans** - 校企合作方案表
5. **company_positions** - 企业岗位信息表
6. **student_applications** - 学生岗位投递表
7. **cooperation_projects** - 合作项目表
8. **project_progress_records** - 项目进度记录表
9. **cooperation_agreements** - 合作协议表
10. **operation_logs** - 操作日志表

### 权限控制
- ✅ RLS（Row Level Security）策略已启用
- ✅ 认证用户可访问所有数据
- ✅ 数据库级别的数据隔离（通过university_id）
- ⏳ 细粒度角色权限控制（预留扩展）

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: shadcn/ui
- **样式方案**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **状态管理**: React Hooks
- **路由**: React Router
- **表单验证**: 内置验证
- **通知提示**: Sonner

## 访问路径

系统入口：`/university/cooperation`

通过Tab切换访问不同模块：
- 合作企业
- 合作方案
- 岗位对接
- 合作项目
- 协议档案
- 数据看板

## 使用说明

### 1. 添加合作企业
1. 进入"合作企业"Tab
2. 点击"新增企业"按钮
3. 填写企业基本信息（企业名称、行业、对接人等）
4. 提交后企业状态为"待审核"

### 2. 审核企业
1. 在企业列表中找到待审核企业
2. 点击"审核通过"按钮快速通过
3. 或点击"查看详情"进行详细审核
4. 可选择"审核通过"或"审核驳回"

### 3. 查看数据统计
1. 进入"数据看板"Tab
2. 查看6个核心指标卡
3. 实时展示最新统计数据

## API接口

所有API接口已封装在 `src/db/cooperation-api.ts` 文件中：

### 企业管理API
- `getCooperationCompanies()` - 获取企业列表
- `getCooperationCompany(id)` - 获取企业详情
- `createCooperationCompany(data)` - 创建企业
- `updateCooperationCompany(id, data)` - 更新企业
- `deleteCooperationCompany(id)` - 删除企业

### 方案管理API
- `getCooperationPlans()` - 获取方案列表
- `getCooperationPlan(id)` - 获取方案详情
- `createCooperationPlan(data)` - 创建方案
- `updateCooperationPlan(id, data)` - 更新方案

### 岗位管理API
- `getCompanyPositions()` - 获取岗位列表
- `getCompanyPosition(id)` - 获取岗位详情
- `updateCompanyPosition(id, data)` - 更新岗位
- `getStudentApplications(positionId)` - 获取投递记录

### 项目管理API
- `getCooperationProjects()` - 获取项目列表
- `getCooperationProject(id)` - 获取项目详情
- `createCooperationProject(data)` - 创建项目
- `updateCooperationProject(id, data)` - 更新项目
- `getProjectProgressRecords(projectId)` - 获取进度记录
- `createProjectProgressRecord(data)` - 创建进度记录

### 协议管理API
- `getCooperationAgreements()` - 获取协议列表
- `getCooperationAgreement(id)` - 获取协议详情
- `createCooperationAgreement(data)` - 创建协议
- `updateCooperationAgreement(id, data)` - 更新协议

### 统计数据API
- `getCooperationStats()` - 获取所有统计数据

## 扩展开发

### 添加新功能
1. 在对应的Tab组件中添加UI
2. 在 `cooperation-api.ts` 中添加API函数
3. 在组件中调用API并处理数据

### 添加权限控制
1. 修改RLS策略（在Supabase迁移文件中）
2. 在前端添加权限判断逻辑
3. 根据用户角色显示/隐藏功能

### 添加文件上传
1. 创建Supabase Storage Bucket
2. 使用 `supabase.storage.from('bucket').upload()` 上传
3. 获取公开URL并保存到数据库

## 注意事项

1. **数据隔离**: 当前使用固定的 `university_id = 1` 进行测试，生产环境需要从用户会话中获取
2. **文件上传**: 文件上传功能已预留字段，需要配置Supabase Storage
3. **权限细化**: 当前所有认证用户可访问，需要根据角色细化权限
4. **操作日志**: 操作日志表已创建，需要在关键操作中记录日志

## 开发状态

✅ **已完成**:
- 数据库表结构设计
- RLS权限策略
- API接口封装
- 6个模块的基础UI
- 合作企业完整功能
- 数据看板完整功能
- 搜索和筛选功能
- 统计指标展示

⏳ **待完善**:
- 方案/岗位/项目/协议的新增编辑功能
- 文件上传下载功能
- 富文本编辑器集成
- 图表可视化
- 细粒度权限控制
- 操作日志记录
- 数据导出功能

## 联系方式

如有问题，请联系开发团队。
