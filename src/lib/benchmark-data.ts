// 行业基准库数据（基于脱敏招聘与能力数据聚合的基准值）
// 用于薪资基准对比与技能标准参考

export interface BenchmarkRole {
  role: string;
  juniorSalary: number; // 初级年薪（万）
  midSalary: number; // 中级年薪（万）
  seniorSalary: number; // 高级年薪（万）
  avgSkillScore: number; // 行业平均能力分（0-100）
  demandIndex: number; // 需求指数 0-100
}

export interface BenchmarkIndustry {
  key: string;
  name: string;
  avgSalary: number;
  roles: BenchmarkRole[];
}

export const BENCHMARK_DATA: BenchmarkIndustry[] = [
  {
    key: 'ai',
    name: '人工智能',
    avgSalary: 38.5,
    roles: [
      { role: '算法工程师', juniorSalary: 25, midSalary: 40, seniorSalary: 70, avgSkillScore: 78, demandIndex: 95 },
      { role: '机器学习工程师', juniorSalary: 22, midSalary: 38, seniorSalary: 65, avgSkillScore: 76, demandIndex: 90 },
      { role: '大模型工程师', juniorSalary: 30, midSalary: 50, seniorSalary: 90, avgSkillScore: 82, demandIndex: 92 },
      { role: '数据科学家', juniorSalary: 24, midSalary: 42, seniorSalary: 72, avgSkillScore: 80, demandIndex: 78 },
      { role: '计算机视觉工程师', juniorSalary: 23, midSalary: 39, seniorSalary: 68, avgSkillScore: 77, demandIndex: 70 },
    ],
  },
  {
    key: 'frontend',
    name: '前端开发',
    avgSalary: 24.8,
    roles: [
      { role: '前端工程师', juniorSalary: 14, midSalary: 24, seniorSalary: 42, avgSkillScore: 72, demandIndex: 88 },
      { role: '全栈工程师', juniorSalary: 18, midSalary: 30, seniorSalary: 52, avgSkillScore: 75, demandIndex: 82 },
      { role: '前端架构师', juniorSalary: 28, midSalary: 45, seniorSalary: 75, avgSkillScore: 85, demandIndex: 60 },
      { role: '小程序开发', juniorSalary: 13, midSalary: 22, seniorSalary: 38, avgSkillScore: 68, demandIndex: 65 },
      { role: '移动端开发', juniorSalary: 16, midSalary: 28, seniorSalary: 48, avgSkillScore: 73, demandIndex: 58 },
    ],
  },
  {
    key: 'data',
    name: '数据分析',
    avgSalary: 22.6,
    roles: [
      { role: '数据分析师', juniorSalary: 12, midSalary: 22, seniorSalary: 38, avgSkillScore: 70, demandIndex: 85 },
      { role: 'BI工程师', juniorSalary: 14, midSalary: 24, seniorSalary: 42, avgSkillScore: 72, demandIndex: 68 },
      { role: '数据工程师', juniorSalary: 18, midSalary: 32, seniorSalary: 55, avgSkillScore: 76, demandIndex: 72 },
      { role: '数据产品经理', juniorSalary: 16, midSalary: 28, seniorSalary: 50, avgSkillScore: 74, demandIndex: 55 },
      { role: '商业分析师', juniorSalary: 15, midSalary: 26, seniorSalary: 46, avgSkillScore: 73, demandIndex: 50 },
    ],
  },
  {
    key: 'product',
    name: '产品经理',
    avgSalary: 26.4,
    roles: [
      { role: '产品经理', juniorSalary: 14, midSalary: 25, seniorSalary: 45, avgSkillScore: 71, demandIndex: 80 },
      { role: '高级产品经理', juniorSalary: 24, midSalary: 38, seniorSalary: 65, avgSkillScore: 78, demandIndex: 65 },
      { role: 'AI产品经理', juniorSalary: 22, midSalary: 40, seniorSalary: 70, avgSkillScore: 80, demandIndex: 72 },
      { role: 'B端产品经理', juniorSalary: 16, midSalary: 30, seniorSalary: 52, avgSkillScore: 74, demandIndex: 60 },
      { role: '产品总监', juniorSalary: 35, midSalary: 55, seniorSalary: 90, avgSkillScore: 84, demandIndex: 40 },
    ],
  },
];

export function getBenchmarkData(key: string): BenchmarkIndustry | undefined {
  return BENCHMARK_DATA.find((d) => d.key === key);
}

// 技能基准：各技能的行业平均掌握度
export interface SkillBenchmark {
  skill: string;
  avgMastery: number; // 行业平均掌握度 0-100
  importance: number; // 重要性 0-100
}

export const SKILL_BENCHMARKS: SkillBenchmark[] = [
  { skill: '编程能力', avgMastery: 62, importance: 92 },
  { skill: '系统设计', avgMastery: 48, importance: 85 },
  { skill: '数据结构', avgMastery: 65, importance: 88 },
  { skill: '算法思维', avgMastery: 55, importance: 82 },
  { skill: '项目管理', avgMastery: 58, importance: 75 },
  { skill: '沟通协作', avgMastery: 70, importance: 78 },
  { skill: '业务理解', avgMastery: 52, importance: 80 },
  { skill: '数据分析', avgMastery: 60, importance: 76 },
  { skill: '文档写作', avgMastery: 68, importance: 65 },
  { skill: '英语能力', avgMastery: 45, importance: 60 },
];