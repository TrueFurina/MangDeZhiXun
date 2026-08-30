// 大学生能力画像年度报告数据（跨用户脱敏聚合）
// 用于年度行业能力画像报告的展示

export interface YearTrend {
  year: string;
  avgScore: number; // 平均综合能力分
  coverage: number; // 能力覆盖率 %
}

export interface DimensionGrowth {
  dimension: string;
  lastYear: number;
  thisYear: number;
}

export interface HotSkill {
  skill: string;
  growth: number; // 同比增长 %
  mastery: number; // 平均掌握度
}

export const YEAR_TRENDS: YearTrend[] = [
  { year: '2021', avgScore: 52, coverage: 48 },
  { year: '2022', avgScore: 56, coverage: 53 },
  { year: '2023', avgScore: 61, coverage: 59 },
  { year: '2024', avgScore: 66, coverage: 65 },
  { year: '2025', avgScore: 71, coverage: 72 },
];

export const DIMENSION_GROWTH: DimensionGrowth[] = [
  { dimension: '编程能力', lastYear: 58, thisYear: 68 },
  { dimension: '系统设计', lastYear: 42, thisYear: 52 },
  { dimension: '数据结构', lastYear: 61, thisYear: 70 },
  { dimension: '算法思维', lastYear: 51, thisYear: 62 },
  { dimension: '项目管理', lastYear: 54, thisYear: 63 },
  { dimension: '沟通协作', lastYear: 66, thisYear: 73 },
  { dimension: '业务理解', lastYear: 48, thisYear: 58 },
  { dimension: '数据分析', lastYear: 56, thisYear: 66 },
];

export const HOT_SKILLS: HotSkill[] = [
  { skill: '大模型/LLM', growth: 156, mastery: 45 },
  { skill: 'Python', growth: 42, mastery: 68 },
  { skill: 'React', growth: 38, mastery: 64 },
  { skill: 'TypeScript', growth: 55, mastery: 58 },
  { skill: '机器学习', growth: 72, mastery: 52 },
  { skill: '数据分析', growth: 48, mastery: 60 },
  { skill: 'SQL', growth: 31, mastery: 66 },
  { skill: '云原生', growth: 65, mastery: 41 },
];

export const REPORT_STATS = {
  totalStudents: 128600,
  totalEvaluations: 342800,
  avgImprovement: 18.6,
  topIndustry: '人工智能',
  topIndustryGrowth: 34.2,
};