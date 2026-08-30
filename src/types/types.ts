// 企业招聘数据类型
export interface EnterpriseHiringOverview {
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

export interface EnterpriseHiringStatistics {
  avgSalStr: string; // 平均薪资字符串
  avgSal: number; // 平均薪资数值
  bkEducation: string; // 本科学历占比
  educationList: Array<{ key: string; value: number }>; // 学历分布
  priProvince: string; // 主要省份
  companyName: string; // 企业名称
  zpnumberList: Array<{ key: string; value: number }>; // 招聘数量时间序列
  salaryList: Array<{ key: string; value: number }>; // 薪资区间分布
  btw3and5Years: string; // 3-5年工作经验占比
  recruitPosition: Array<{ key: string; value: number }>; // 招聘职位列表
  yearsList: Array<{ key: string; value: number }>; // 工作年限分布
  zpnumber: number; // 总招聘数量
  ssNumHisList: Array<{ key: string; value: number }>; // 年度招聘数量统计
}

export interface EnterpriseHiringCache {
  id: string;
  keyword: string;
  company_name?: string;
  title_kw?: string;
  title_type?: string;
  city?: string;
  src?: string;
  title_level?: string;
  avg_sal?: string;
  title_cnt?: number;
  title_modify_date?: string;
  city_cnt?: number;
  avg_sal_str?: string;
  avg_sal_num?: number;
  bk_education?: string;
  education_list?: Array<{ key: string; value: number }>;
  pri_province?: string;
  zpnumber_list?: Array<{ key: string; value: number }>;
  salary_list?: Array<{ key: string; value: number }>;
  btw3and5_years?: string;
  recruit_position?: Array<{ key: string; value: number }>;
  years_list?: Array<{ key: string; value: number }>;
  zpnumber?: number;
  ss_num_his_list?: Array<{ key: string; value: number }>;
  created_at: string;
  updated_at: string;
}

export interface EnterpriseHiringQueryHistory {
  id: string;
  user_id: string;
  keyword: string;
  query_type: 'overview' | 'statistics';
  success: boolean;
  error_message?: string;
  created_at: string;
}

// 咨询预约类型
export interface Consultation {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  service_type: string;
  message?: string;
  status: 'pending' | 'contacted' | 'completed';
  created_at: string;
}

// 咨询表单输入类型
export interface ConsultationInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  service_type: string;
  message?: string;
}

// 服务类型
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

// 解决方案类型
export interface Solution {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

// 案例类型
export interface Case {
  id: string;
  company: string;
  industry: string;
  title: string;
  description: string;
  image: string;
  results: string[];
  tags: string[];
}

// 团队成员类型
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  avatar: string;
  bio: string;
  expertise: string[];
}

// 资讯类型
export interface News {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  publishDate: string;
  author: string;
}

// 统计数据类型
export interface Stats {
  projects: number;
  clients: number;
  experts: number;
  satisfaction: number;
}
