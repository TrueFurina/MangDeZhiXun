// 三位一体平台类型定义

// ==================== 用户相关 ====================
export type UserRole = 'student' | 'company_hr' | 'university_staff' | 'admin';

export interface User {
  user_id: number;
  email?: string;
  phone?: string;
  user_name: string;
  role: UserRole;
  avatar_url?: string;
  
  // 学生专属
  student_id?: string;
  university_id?: number;
  major?: string;
  grade?: number;
  education?: string;
  
  // 企业HR专属
  company_id?: number;
  department?: string;
  
  // 高校老师专属
  university_staff_id?: string;
  
  status: string;
  created_at: string;
}

// ==================== 企业相关 ====================
export interface Company {
  company_id: number;
  company_name: string;
  industry?: string;
  company_size?: string;
  company_desc?: string;
  contact_email?: string;
  contact_phone?: string;
  subscription_plan: string;
  subscription_expire_date?: string;
  created_at: string;
}

// ==================== 高校相关 ====================
export interface University {
  university_id: number;
  university_name: string;
  university_type?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  service_status: string;
  created_at: string;
}

// ==================== 岗位相关 ====================
export interface Position {
  position_id: number;
  position_name: string;
  position_type: 1 | 2 | 3 | 4;
  salary_range: string;
  required_skills: Skill[];
  position_desc?: string;
  job_url?: string;
  company_id?: number;
  competency_model_id?: number;
  status: string;
  update_time: string;
}

export interface Skill {
  skill_name: string;
  min_proficiency: number;
}

// ==================== 胜任力模型相关 ====================
export interface CompetencyModel {
  model_id: number;
  model_name: string;
  position_id?: number;
  company_id?: number;
  
  // 4维度胜任力模型
  knowledge_items: CompetencyItem[];
  skills_items: CompetencyItem[];
  quality_items: CompetencyItem[];
  soft_skills_items: CompetencyItem[];
  
  model_desc?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CompetencyItem {
  name: string;
  weight: number;
  level: string;
}

// ==================== 测评相关 ====================
export interface Evaluation {
  evaluation_id: number;
  user_id: number;
  position_id?: number;
  model_id?: number;
  
  // 测评结果
  total_score: number;
  match_level: 'S' | 'A' | 'B' | 'C';
  
  // 4维度得分
  knowledge_score: number;
  skills_score: number;
  quality_score: number;
  soft_skills_score: number;
  
  // 详细结果
  detailed_results: any;
  strengths: string[];
  weaknesses: string[];
  
  evaluation_type: string;
  status: string;
  created_at: string;
}

// ==================== 人岗匹配相关 ====================
export interface Match {
  match_id: number;
  user_id: number;
  position_id: number;
  evaluation_id?: number;
  match_score: number;
  match_details: any;
  status: string;
  created_at: string;
}

// ==================== 学习资源相关 ====================
export interface LearningResource {
  resource_id: number;
  resource_name: string;
  resource_type: 'course' | 'video' | 'article' | 'project';
  resource_url?: string;
  resource_desc?: string;
  skill_tags: string[];
  difficulty_level: string;
  duration: number;
  provider?: string;
  created_at: string;
}

// ==================== 成长计划相关 ====================
export interface GrowthPlan {
  plan_id: number;
  user_id: number;
  evaluation_id?: number;
  
  target_position: string;
  current_level: string;
  target_level: string;
  
  // 分阶段计划
  phase_1_tasks: Task[];
  phase_2_tasks: Task[];
  phase_3_tasks: Task[];
  
  recommended_resources: number[];
  estimated_duration: number;
  
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  task_name: string;
  task_desc: string;
  completed: boolean;
}

// ==================== 订阅套餐相关 ====================
export interface Subscription {
  subscription_id: number;
  company_id: number;
  plan_type: 'basic' | 'professional' | 'enterprise';
  plan_price: number;
  
  start_date: string;
  end_date: string;
  
  max_positions: number;
  max_evaluations: number;
  max_resumes: number;
  
  features: string[];
  status: string;
  created_at: string;
}

// ==================== 统计数据相关 ====================
export interface DashboardStats {
  total_positions?: number;
  total_resumes?: number;
  total_evaluations?: number;
  high_match_candidates?: number;
  
  // 高校端统计
  total_students?: number;
  employment_rate?: number;
  major_match_rate?: number;
  average_salary?: number;
}
