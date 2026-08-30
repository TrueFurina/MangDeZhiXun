// 行业人才地图数据（基于公开招聘市场调研聚合，脱敏基准值）
// 数据用于可视化展示行业人才的地域、薪资、技能分布

export interface RegionDatum {
  region: string;
  count: number;
  salary: number; // 平均年薪（万元）
}

export interface SalaryBand {
  range: string;
  count: number;
}

export interface SkillHeat {
  skill: string;
  demand: number; // 0-100 需求热度
}

export interface IndustryTalentData {
  key: string;
  name: string;
  desc: string;
  totalJobs: number;
  avgSalary: number;
  growth: number; // 同比增长率 %
  regions: RegionDatum[];
  salaryBands: SalaryBand[];
  skills: SkillHeat[];
}

export const INDUSTRY_TALENT_DATA: IndustryTalentData[] = [
  {
    key: 'ai',
    name: '人工智能',
    desc: '大模型、机器学习、计算机视觉方向人才需求旺盛',
    totalJobs: 128600,
    avgSalary: 38.5,
    growth: 34.2,
    regions: [
      { region: '北京', count: 32100, salary: 45.2 },
      { region: '上海', count: 24800, salary: 42.1 },
      { region: '深圳', count: 21900, salary: 41.6 },
      { region: '杭州', count: 18600, salary: 39.8 },
      { region: '广州', count: 12400, salary: 34.5 },
      { region: '成都', count: 9200, salary: 31.2 },
      { region: '南京', count: 7800, salary: 33.4 },
      { region: '武汉', count: 6400, salary: 29.8 },
    ],
    salaryBands: [
      { range: '15万以下', count: 8600 },
      { range: '15-25万', count: 22400 },
      { range: '25-40万', count: 41200 },
      { range: '40-60万', count: 31800 },
      { range: '60-100万', count: 18600 },
      { range: '100万以上', count: 6000 },
    ],
    skills: [
      { skill: 'Python', demand: 96 },
      { skill: 'PyTorch', demand: 89 },
      { skill: '大模型/LLM', demand: 88 },
      { skill: '机器学习', demand: 84 },
      { skill: '深度学习', demand: 81 },
      { skill: 'C++', demand: 72 },
      { skill: '计算机视觉', demand: 68 },
      { skill: '分布式计算', demand: 64 },
      { skill: 'NLP', demand: 61 },
      { skill: '强化学习', demand: 52 },
    ],
  },
  {
    key: 'frontend',
    name: '前端开发',
    desc: 'React/Vue 生态持续繁荣，全栈与跨端能力受青睐',
    totalJobs: 96400,
    avgSalary: 24.8,
    growth: 12.5,
    regions: [
      { region: '北京', count: 18600, salary: 28.4 },
      { region: '上海', count: 16200, salary: 27.6 },
      { region: '深圳', count: 14800, salary: 27.1 },
      { region: '杭州', count: 12400, salary: 26.2 },
      { region: '广州', count: 9600, salary: 22.8 },
      { region: '成都', count: 8200, salary: 20.4 },
      { region: '南京', count: 6800, salary: 21.6 },
      { region: '西安', count: 5200, salary: 19.2 },
    ],
    salaryBands: [
      { range: '10万以下', count: 12400 },
      { range: '10-18万', count: 28600 },
      { range: '18-30万', count: 31200 },
      { range: '30-45万', count: 16800 },
      { range: '45-70万', count: 6400 },
      { range: '70万以上', count: 1000 },
    ],
    skills: [
      { skill: 'React', demand: 94 },
      { skill: 'TypeScript', demand: 91 },
      { skill: 'Vue', demand: 82 },
      { skill: 'Node.js', demand: 78 },
      { skill: 'Webpack/Vite', demand: 71 },
      { skill: 'CSS/HTML5', demand: 69 },
      { skill: '小程序', demand: 66 },
      { skill: 'Next.js', demand: 61 },
      { skill: 'React Native', demand: 54 },
      { skill: 'WebGL/Three.js', demand: 42 },
    ],
  },
  {
    key: 'data',
    name: '数据分析',
    desc: '数据驱动决策成为企业标配，BI 与数据科学岗位增长',
    totalJobs: 74200,
    avgSalary: 22.6,
    growth: 18.8,
    regions: [
      { region: '北京', count: 14200, salary: 25.8 },
      { region: '上海', count: 12800, salary: 25.1 },
      { region: '深圳', count: 11600, salary: 24.6 },
      { region: '杭州', count: 9400, salary: 23.4 },
      { region: '广州', count: 7200, salary: 20.8 },
      { region: '成都', count: 6100, salary: 18.9 },
      { region: '武汉', count: 5400, salary: 18.2 },
      { region: '苏州', count: 4200, salary: 21.0 },
    ],
    salaryBands: [
      { range: '8万以下', count: 9200 },
      { range: '8-15万', count: 22400 },
      { range: '15-25万', count: 26800 },
      { range: '25-40万', count: 11200 },
      { range: '40-60万', count: 3600 },
      { range: '60万以上', count: 1000 },
    ],
    skills: [
      { skill: 'SQL', demand: 95 },
      { skill: 'Python', demand: 88 },
      { skill: 'Excel', demand: 84 },
      { skill: 'Tableau', demand: 72 },
      { skill: 'Power BI', demand: 68 },
      { skill: '统计学', demand: 66 },
      { skill: 'R语言', demand: 58 },
      { skill: '数据建模', demand: 54 },
      { skill: '机器学习', demand: 49 },
      { skill: '数据可视化', demand: 47 },
    ],
  },
  {
    key: 'product',
    name: '产品经理',
    desc: 'B端与 AI 产品方向需求上升，复合型产品人才稀缺',
    totalJobs: 58600,
    avgSalary: 26.4,
    growth: 9.2,
    regions: [
      { region: '北京', count: 12600, salary: 30.2 },
      { region: '上海', count: 10800, salary: 29.1 },
      { region: '深圳', count: 9400, salary: 28.4 },
      { region: '杭州', count: 8200, salary: 27.6 },
      { region: '广州', count: 5600, salary: 23.8 },
      { region: '成都', count: 4400, salary: 21.2 },
      { region: '南京', count: 3800, salary: 22.4 },
      { region: '长沙', count: 2600, salary: 18.6 },
    ],
    salaryBands: [
      { range: '10万以下', count: 6800 },
      { range: '10-18万', count: 16400 },
      { range: '18-30万', count: 19800 },
      { range: '30-50万', count: 11200 },
      { range: '50-80万', count: 3600 },
      { range: '80万以上', count: 800 },
    ],
    skills: [
      { skill: '需求分析', demand: 93 },
      { skill: '原型设计', demand: 86 },
      { skill: '用户研究', demand: 78 },
      { skill: '数据分析', demand: 74 },
      { skill: '项目管理', demand: 71 },
      { skill: 'Axure/Figma', demand: 68 },
      { skill: '商业模式', demand: 62 },
      { skill: 'AI产品', demand: 58 },
      { skill: '增长运营', demand: 54 },
      { skill: '行业洞察', demand: 51 },
    ],
  },
];

export function getIndustryData(key: string): IndustryTalentData | undefined {
  return INDUSTRY_TALENT_DATA.find((d) => d.key === key);
}