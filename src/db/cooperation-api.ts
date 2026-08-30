// 校企合作模块API封装
import { supabase } from './supabase';

// ==================== 类型定义 ====================

export interface CooperationCompany {
  id: string;
  university_id: number;
  company_name: string;
  credit_code?: string;
  industry: string;
  company_scale?: string;
  cooperation_level: string;
  address?: string;
  contact_person: string;
  contact_phone: string;
  contact_email?: string;
  business_license_url?: string;
  qualification_files?: string[];
  audit_status: string;
  audit_comment?: string;
  company_status: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CooperationPlan {
  id: string;
  university_id: number;
  company_id: string;
  plan_name: string;
  plan_type: string;
  plan_status: string;
  cooperation_start_date?: string;
  cooperation_end_date?: string;
  plan_details?: string;
  responsible_person: string;
  responsible_phone: string;
  company_contact?: string;
  plan_attachments?: string[];
  landing_result?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyPosition {
  id: string;
  university_id: number;
  company_id: string;
  position_name: string;
  position_type: string;
  industry?: string;
  work_location?: string;
  recruit_count?: number;
  salary_range?: string;
  position_requirements?: string;
  competency_model_id?: string;
  published_at: string;
  deadline?: string;
  audit_status: string;
  position_status: string;
  audit_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentApplication {
  id: string;
  position_id: string;
  student_id: string;
  student_name: string;
  student_major?: string;
  student_grade?: string;
  contact_phone?: string;
  competency_score?: number;
  match_score?: number;
  application_status: string;
  applied_at: string;
  updated_at: string;
}

export interface CooperationProject {
  id: string;
  university_id: number;
  plan_id?: string;
  company_id: string;
  project_name: string;
  project_type: string;
  project_stage: string;
  project_start_date?: string;
  project_end_date?: string;
  project_leader: string;
  project_members?: string[];
  company_contact?: string;
  project_goals?: string;
  stage_plans?: any;
  progress_percentage: number;
  project_attachments?: string[];
  acceptance_result?: string;
  acceptance_report_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectProgressRecord {
  id: string;
  project_id: string;
  record_date: string;
  progress_content: string;
  evidence_files?: string[];
  recorder: string;
  created_at: string;
}

export interface CooperationAgreement {
  id: string;
  university_id: number;
  company_id: string;
  agreement_name: string;
  agreement_type: string;
  signing_entity: string;
  effective_start_date: string;
  effective_end_date: string;
  agreement_status: string;
  agreement_file_url: string;
  signing_date?: string;
  agreement_content?: string;
  archived_at?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// ==================== 合作企业API ====================

export async function getCooperationCompanies(universityId?: number) {
  let query = supabase
    .from('cooperation_companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as CooperationCompany[];
}

export async function getCooperationCompany(id: string) {
  const { data, error } = await supabase
    .from('cooperation_companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as CooperationCompany | null;
}

export async function createCooperationCompany(company: Partial<CooperationCompany>) {
  const { data, error } = await supabase
    .from('cooperation_companies')
    .insert(company)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationCompany;
}

export async function updateCooperationCompany(id: string, updates: Partial<CooperationCompany>) {
  const { data, error } = await supabase
    .from('cooperation_companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationCompany;
}

export async function deleteCooperationCompany(id: string) {
  const { error } = await supabase
    .from('cooperation_companies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== 合作方案API ====================

export async function getCooperationPlans(universityId?: number) {
  let query = supabase
    .from('cooperation_plans')
    .select('*, cooperation_companies(company_name)')
    .order('created_at', { ascending: false });

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function getCooperationPlan(id: string) {
  const { data, error } = await supabase
    .from('cooperation_plans')
    .select('*, cooperation_companies(company_name, contact_person, contact_phone)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCooperationPlan(plan: Partial<CooperationPlan>) {
  const { data, error } = await supabase
    .from('cooperation_plans')
    .insert(plan)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationPlan;
}

export async function updateCooperationPlan(id: string, updates: Partial<CooperationPlan>) {
  const { data, error } = await supabase
    .from('cooperation_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationPlan;
}

// ==================== 岗位对接API ====================

export async function getCompanyPositions(universityId?: number) {
  let query = supabase
    .from('company_positions')
    .select('*, cooperation_companies(company_name)')
    .order('created_at', { ascending: false });

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function getCompanyPosition(id: string) {
  const { data, error } = await supabase
    .from('company_positions')
    .select('*, cooperation_companies(company_name, contact_person, contact_phone)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateCompanyPosition(id: string, updates: Partial<CompanyPosition>) {
  const { data, error } = await supabase
    .from('company_positions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CompanyPosition;
}

export async function getStudentApplications(positionId: string) {
  const { data, error } = await supabase
    .from('student_applications')
    .select('*')
    .eq('position_id', positionId)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  return data as StudentApplication[];
}

// ==================== 合作项目API ====================

export async function getCooperationProjects(universityId?: number) {
  let query = supabase
    .from('cooperation_projects')
    .select('*, cooperation_companies(company_name)')
    .order('created_at', { ascending: false });

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function getCooperationProject(id: string) {
  const { data, error } = await supabase
    .from('cooperation_projects')
    .select('*, cooperation_companies(company_name), cooperation_plans(plan_name)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCooperationProject(project: Partial<CooperationProject>) {
  const { data, error } = await supabase
    .from('cooperation_projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationProject;
}

export async function updateCooperationProject(id: string, updates: Partial<CooperationProject>) {
  const { data, error } = await supabase
    .from('cooperation_projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationProject;
}

export async function getProjectProgressRecords(projectId: string) {
  const { data, error } = await supabase
    .from('project_progress_records')
    .select('*')
    .eq('project_id', projectId)
    .order('record_date', { ascending: false });

  if (error) throw error;
  return data as ProjectProgressRecord[];
}

export async function createProjectProgressRecord(record: Partial<ProjectProgressRecord>) {
  const { data, error } = await supabase
    .from('project_progress_records')
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data as ProjectProgressRecord;
}

// ==================== 合作协议API ====================

export async function getCooperationAgreements(universityId?: number) {
  let query = supabase
    .from('cooperation_agreements')
    .select('*, cooperation_companies(company_name)')
    .order('created_at', { ascending: false });

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function getCooperationAgreement(id: string) {
  const { data, error } = await supabase
    .from('cooperation_agreements')
    .select('*, cooperation_companies(company_name, contact_person, contact_phone)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCooperationAgreement(agreement: Partial<CooperationAgreement>) {
  const { data, error } = await supabase
    .from('cooperation_agreements')
    .insert(agreement)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationAgreement;
}

export async function updateCooperationAgreement(id: string, updates: Partial<CooperationAgreement>) {
  const { data, error } = await supabase
    .from('cooperation_agreements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CooperationAgreement;
}

// ==================== 统计数据API ====================

export async function getCooperationStats(universityId?: number) {
  // 获取各项统计数据
  const [companies, plans, positions, applications, projects, agreements] = await Promise.all([
    getCooperationCompanies(universityId),
    getCooperationPlans(universityId),
    getCompanyPositions(universityId),
    supabase.from('student_applications').select('*'),
    getCooperationProjects(universityId),
    getCooperationAgreements(universityId)
  ]);

  return {
    totalCompanies: companies.length,
    approvedCompanies: companies.filter(c => c.audit_status === '审核通过').length,
    pendingCompanies: companies.filter(c => c.audit_status === '待审核').length,
    totalPlans: plans.length,
    landedPlans: plans.filter((p: any) => p.plan_status === '已落地').length,
    inProgressPlans: plans.filter((p: any) => p.plan_status === '推进中').length,
    totalPositions: positions.length,
    activePositions: positions.filter((p: any) => p.position_status === '招聘中').length,
    totalApplications: applications.data?.length || 0,
    hiredApplications: applications.data?.filter((a: any) => a.application_status === '已录用').length || 0,
    totalProjects: projects.length,
    inProgressProjects: projects.filter((p: any) => p.project_stage === '执行期').length,
    completedProjects: projects.filter((p: any) => p.project_stage === '已完成').length,
    totalAgreements: agreements.length,
    activeAgreements: agreements.filter((a: any) => a.agreement_status === '生效中').length,
    expiringAgreements: agreements.filter((a: any) => {
      if (a.agreement_status !== '生效中') return false;
      const endDate = new Date(a.effective_end_date);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length
  };
}

// ==================== 企业招聘数据查询API ====================

// 招聘概况数据类型
export interface HireOverviewData {
  titleKw: string; // 职位关键词
  titleType: string; // 职位类型
  city: string; // 城市分布
  src: string; // 招聘来源
  titleLevel: string; // 职位级别
  avgSal: string; // 平均薪资
  titleCnt: number; // 职位数量
  titleModifyDate: string; // 职位更新时间
  cityCnt: number; // 城市数量
}

// 招聘统计数据类型
export interface HireStatisticsData {
  avgSalStr: string; // 平均薪资字符串
  bkEducation: string; // 本科学历占比
  educationList: Array<{ value: number; key: string }>; // 学历分布列表
  priProvince: string; // 主要省份
  companyName: string; // 企业名称
  zpnumberList?: Array<any>; // 招聘数量时间序列
  salaryList?: Array<any>; // 薪资区间分布
  btw3and5Years: string; // 3-5年工作经验占比
  recruitPosition?: Array<any>; // 招聘职位列表
  avgSal: number; // 平均薪资数值
  yearsList?: Array<any>; // 工作年限分布
  zpnumber: number; // 总招聘数量
  ssNumHisList?: Array<any>; // 年度招聘数量统计
}

// 查询企业招聘概况
export async function getHireOverview(keyword: string): Promise<HireOverviewData | null> {
  try {
    const { data, error } = await supabase.functions.invoke('hire-overview', {
      body: { keyword }
    });

    if (error) {
      console.error('招聘概况查询错误:', error);
      throw new Error(error.message || '招聘概况查询失败');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.data as HireOverviewData;
  } catch (error) {
    console.error('招聘概况查询失败:', error);
    throw error;
  }
}

// 查询企业招聘数据统计
export async function getHireStatistics(keyword: string): Promise<HireStatisticsData | null> {
  try {
    const { data, error } = await supabase.functions.invoke('hire-statistics', {
      body: { keyword }
    });

    if (error) {
      console.error('招聘数据统计查询错误:', error);
      throw new Error(error.message || '招聘数据统计查询失败');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.data as HireStatisticsData;
  } catch (error) {
    console.error('招聘数据统计查询失败:', error);
    throw error;
  }
}
